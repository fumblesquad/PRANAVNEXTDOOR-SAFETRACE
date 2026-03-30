import { collection, addDoc, getDoc, doc, query, orderBy, limit, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './config';

export async function submitReport({ type, description, location, evidenceUrls = [], userId = null }) {
  const caseId = generateCaseId();
  const reportData = {
    caseId,
    type,
    description,
    location,
    evidenceUrls,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    ...(userId ? { userId } : {}),
  };
  await addDoc(collection(db, 'reports'), reportData);
  return caseId;
}

export async function getReportByCaseId(caseId) {
  const q = query(collection(db, 'reports'));
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    if (docSnap.data().caseId === caseId) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  }
  return null;
}

export async function getRecentReports(count = 10) {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getUserReports(userId) {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.userId === userId);
}

function generateCaseId() {
  const prefix = 'ST';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
