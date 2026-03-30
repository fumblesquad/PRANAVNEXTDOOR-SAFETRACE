import { supabase } from './supabase'
import { decryptData } from '../utils/encryption'

const severityFromType = (type) => {
  const high = ['harassment', 'stalking', 'sos', 'theft', 'unsafe']
  return high.includes(type?.toLowerCase()) ? 'high' : 'medium'
}

const statusToUI = (dbStatus) => {
  const map = { under_review: 'reviewing', escalated: 'escalated', resolved: 'resolved', submitted: 'submitted' }
  return map[dbStatus] ?? dbStatus
}

const normalizeReport = (raw, decrypted) => ({
  id: raw.case_id,
  case_id: raw.case_id,
  status: statusToUI(raw.status),
  created_at: raw.created_at,
  updated_at: raw.updated_at ?? raw.created_at,
  uid: raw.uid,
  type: decrypted.type ?? 'Unknown',
  description: decrypted.description ?? '',
  location: decrypted.location?.label ?? 'Location not specified',
  coordinates: { lat: decrypted.location?.lat, lng: decrypted.location?.lng },
  severity: severityFromType(decrypted.type),
  date: new Date(raw.created_at).toLocaleDateString('en-IN'),
  time: new Date(raw.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  statusHistory: [
    { status: 'submitted', ts: new Date(raw.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), note: '' },
    ...(raw.status !== 'submitted' ? [{ status: statusToUI(raw.status), ts: new Date(raw.updated_at ?? raw.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), note: raw.status_note ?? '' }] : [])
  ],
  submittedAt: new Date(raw.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
})

export const getAllReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: [], error }

  const decrypted = await Promise.all(
    data.map(async (report) => {
      try {
        const sensitive = await decryptData(report.encrypted_data, report.iv, report.case_id)
        return normalizeReport(report, sensitive)
      } catch {
        return normalizeReport(report, {
          type: 'encrypted',
          description: 'Could not decrypt this report',
          location: { label: 'Unknown' }
        })
      }
    })
  )

  return { data: decrypted, error: null }
}

export const updateReportStatus = async (caseId, status, note = '') => {
  const { data, error } = await supabase
    .from('reports')
    .update({
      status,
      updated_at: new Date().toISOString(),
      status_note: note
    })
    .eq('case_id', caseId)
    .select()

  console.log('[ReportsService] Update result:', JSON.stringify({ data, error }, null, 2))

  return { error }
}
