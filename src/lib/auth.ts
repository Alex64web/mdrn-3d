import crypto from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'mdrn_auth_user'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false
  }
  const [salt, key] = storedHash.split(':')
  const keyBuffer = Buffer.from(key, 'hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(keyBuffer, derivedKey)
}

export async function setSession(userId: string) {
  const cookieStore = cookies()
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  })
}

export async function clearSession() {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  // Also clear legacy cookie if present
  cookieStore.delete('active_user_id')
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = cookies()
  const val = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return val || null
}

export async function getCurrentUser() {
  const userId = await getSessionUserId()
  if (!userId) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { makerProfile: true }
    })
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}