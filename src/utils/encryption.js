const PBKDF2_ITERATIONS = 100000

export const deriveKey = async (caseId) => {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(caseId),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('safetrace-salt-v1'),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export const decryptData = async (ciphertext, iv, caseId) => {
  const key = await deriveKey(caseId)
  const decoder = new TextDecoder()
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) },
    key,
    Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
  )
  return JSON.parse(decoder.decode(decrypted))
}
