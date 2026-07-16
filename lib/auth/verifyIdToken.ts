import { createRemoteJWKSet, jwtVerify } from 'jose'

// Firebase signs ID tokens (RS256) with rotating Google keys published here.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
)

/**
 * Verify a Firebase ID token JWT without the Admin SDK.
 * Checks signature (Google JWKS), issuer, and audience against the project id.
 * Returns the user's uid, or throws if invalid.
 */
export async function verifyIdToken(token: string): Promise<string> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projectId) throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID')

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  })

  // Firebase puts the uid in `sub` (and mirrors it in `user_id`).
  const uid = (payload.sub as string) || (payload.user_id as string)
  if (!uid) throw new Error('Token missing subject')
  return uid
}

/** Pull the Bearer token out of an Authorization header. */
export function bearerFromHeader(header: string | null): string | null {
  if (!header) return null
  const match = /^Bearer (.+)$/i.exec(header.trim())
  return match ? match[1] : null
}
