/*
 * Supabase SQL Schema (run once in the Supabase SQL editor)
 * ─────────────────────────────────────────────────────────
 *
 * create table reports (
 *   id uuid default gen_random_uuid() primary key,
 *   case_id text unique not null,
 *   type text not null,
 *   description text,
 *   location jsonb,
 *   status text default 'submitted',
 *   uid uuid references auth.users(id) null,
 *   evidence_refs text[] default '{}',
 *   created_at timestamptz default now()
 * );
 *
 * create table users (
 *   uid uuid references auth.users(id) primary key,
 *   email text,
 *   auth_provider text,
 *   case_ids text[] default '{}',
 *   created_at timestamptz default now()
 * );
 *
 * create table zones (
 *   id uuid default gen_random_uuid() primary key,
 *   zone_id text unique not null,
 *   name text not null,
 *   city text not null,
 *   risk_score int check (risk_score between 0 and 100),
 *   risk_level text check (risk_level in ('low', 'medium', 'high')),
 *   incident_count int default 0,
 *   coordinates jsonb,
 *   last_updated timestamptz default now()
 * );
 *
 * create table evidence (
 *   id uuid default gen_random_uuid() primary key,
 *   evidence_id text unique not null,
 *   case_id text references reports(case_id),
 *   file_name text,
 *   file_type text,
 *   sha256_hash text not null,
 *   uid uuid references auth.users(id) null,
 *   uploaded_at timestamptz default now()
 * );
 *
 * alter table reports  enable row level security;
 * alter table users    enable row level security;
 * alter table zones    enable row level security;
 * alter table evidence enable row level security;
 *
 * create policy "Anyone can insert reports"         on reports  for insert with check (true);
 * create policy "Anyone can read reports by case_id" on reports  for select using (true);
 * create policy "Anyone can read zones"             on zones    for select using (true);
 * create policy "Users can read own evidence"       on evidence for select using (auth.uid() = uid or uid is null);
 * create policy "Anyone can insert evidence"        on evidence for insert with check (true);
 */

import { supabase } from './supabase'
import { EMERGENCY_NUMBER } from '../config/emergency'

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normalizeReport(row) {
  return {
    id: row.id,
    caseId: row.case_id,
    type: row.type,
    description: row.description,
    location: row.location,
    status: row.status,
    uid: row.uid,
    evidenceRefs: row.evidence_refs ?? [],
    createdAt: row.created_at,
  }
}

function normalizeEvidence(row) {
  return {
    id: row.id,
    evidenceId: row.evidence_id,
    caseId: row.case_id,
    fileName: row.file_name,
    fileType: row.file_type,
    sha256Hash: row.sha256_hash,
    uid: row.uid,
    uploadedAt: row.uploaded_at,
  }
}

function normalizeZone(row) {
  return {
    id: row.id,
    zoneId: row.zone_id,
    name: row.name,
    city: row.city,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    incidentCount: row.incident_count,
    coordinates: row.coordinates,
    lastUpdated: row.last_updated,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCaseId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes).map(b => chars[b % chars.length]).join('')
  return `ST-${suffix}`
}

function persistCaseIdLocally(caseId) {
  try {
    const existing = JSON.parse(localStorage.getItem('safetrace_cases') || '[]')
    if (!existing.includes(caseId)) existing.push(caseId)
    localStorage.setItem('safetrace_cases', JSON.stringify(existing))
  } catch {
    // localStorage unavailable — skip silently
  }
}

// ─── Reports ─────────────────────────────────────────────────────────────────

/**
 * Inserts a new report. Auto-generates caseId (ST-XXXXXX) and saves it to
 * localStorage under "safetrace_cases" (append, never overwrite).
 *
 * @param {{ type, description, location, uid?, evidence_refs? }} reportData
 * @returns {Promise<string>} the generated caseId
 */
export async function submitReport({ type, description, location, uid = null, evidence_refs = [] }) {
  const caseId = generateCaseId()

  const { error } = await supabase.from('reports').insert({
    case_id: caseId,
    type,
    description,
    location,
    uid,
    evidence_refs,
  })

  if (error) throw error

  persistCaseIdLocally(caseId)
  return caseId
}

/**
 * Fetches a report by its human-readable case ID (e.g. "ST-AB12CD").
 * No auth required.
 */
export async function getReportByCaseId(caseId) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('case_id', caseId.toUpperCase().trim())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows
    throw error
  }
  return normalizeReport(data)
}

/**
 * Updates the status field of a report by caseId.
 * @param {'submitted'|'under_review'|'escalated'|'resolved'} status
 */
export async function updateReportStatus(caseId, status) {
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('case_id', caseId)

  if (error) throw error
}

/**
 * Fetches all reports linked to a given user UID.
 */
export async function getUserReports(uid) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('uid', uid)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(normalizeReport)
}

// ─── Users ───────────────────────────────────────────────────────────────────

/**
 * Upserts a user row. Safe to call on every sign-in.
 */
export async function createUser(uid, email, provider) {
  const { error } = await supabase.from('users').upsert(
    { uid, email, auth_provider: provider },
    { onConflict: 'uid', ignoreDuplicates: true }
  )
  if (error) throw error
}

/**
 * Appends a caseId to the user's case_ids array. No-ops if already present.
 */
export async function linkCaseToUser(uid, caseId) {
  const { data, error: fetchError } = await supabase
    .from('users')
    .select('case_ids')
    .eq('uid', uid)
    .single()

  if (fetchError) throw fetchError

  const existing = data?.case_ids ?? []
  if (existing.includes(caseId)) return

  const { error } = await supabase
    .from('users')
    .update({ case_ids: [...existing, caseId] })
    .eq('uid', uid)

  if (error) throw error
}

export async function getUser(uid) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uid', uid)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return {
    uid: data.uid,
    email: data.email,
    authProvider: data.auth_provider,
    caseIds: data.case_ids ?? [],
    createdAt: data.created_at,
  }
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

/**
 * Inserts evidence metadata. No file upload — caller must compute sha256Hash
 * client-side using src/utils/hashFile.js before calling this.
 */
export async function addEvidence({ caseId, fileName, fileType, sha256Hash, uid = null }) {
  const evidenceId = generateCaseId().replace('ST-', 'EV-')

  const { data, error } = await supabase.from('evidence').insert({
    evidence_id: evidenceId,
    case_id: caseId,
    file_name: fileName,
    file_type: fileType,
    sha256_hash: sha256Hash,
    uid,
  }).select().single()

  if (error) throw error
  return normalizeEvidence(data)
}

/**
 * Fetches all evidence records for a given caseId.
 */
export async function getEvidenceByCase(caseId) {
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('case_id', caseId)
    .order('uploaded_at', { ascending: true })

  if (error) throw error
  return data.map(normalizeEvidence)
}

/**
 * Fetches the N most recent reports across all users.
 */
export async function getRecentReports(count = 10) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(count)

  if (error) throw error
  return data.map(normalizeReport)
}

// ─── Zones ───────────────────────────────────────────────────────────────────

/**
 * Fetches all zones for a city, ordered by risk_score descending.
 */
export async function getZones(city) {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('city', city)
    .order('risk_score', { ascending: false })

  if (error) throw error
  return data.map(normalizeZone)
}

// ─── SOS Dispatch ─────────────────────────────────────────────────────────────

/**
 * The single SOS dispatch action:
 *   1. Attempts to capture geolocation (5 s timeout).
 *   2. Submits an anonymous SOS report (failures are non-blocking).
 *   3. Opens the emergency dialer.
 *
 * @param {string|{uid?: string|null, fallbackLocation?: {lat?: number|string, lng?: number|string}}|null} uidOrOptions
 *   Optional user UID or an options object.
 * @param {{lat?: number|string, lng?: number|string}|null} fallbackLocation
 *   Optional backup location when browser geolocation is unavailable.
 */
export async function dispatchSOS(uidOrOptions = null, fallbackLocation = null) {
  let uid = uidOrOptions
  let fallback = fallbackLocation

  if (uidOrOptions && typeof uidOrOptions === 'object' && !Array.isArray(uidOrOptions)) {
    uid = uidOrOptions.uid ?? null
    fallback = uidOrOptions.fallbackLocation ?? null
  }

  let location = null
  try {
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
    )
    location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
  } catch {
    if (fallback?.lat != null && fallback?.lng != null) {
      location = {
        lat: Number(fallback.lat),
        lng: Number(fallback.lng),
      }
    }
  }

  try {
    await submitReport({
      type: 'sos',
      description: 'Emergency SOS triggered',
      location,
      uid,
    })
  } catch (err) {
    console.error('[SOS] report submission failed:', err)
  }

  window.location.href = `tel:${EMERGENCY_NUMBER}`
}
