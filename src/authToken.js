import { auth, isFirebaseConfigured } from './firebase'

export async function getAuthToken() {
  if (!isFirebaseConfigured || !auth?.currentUser) return null
  try {
    return await auth.currentUser.getIdToken()
  } catch {
    return null
  }
}
