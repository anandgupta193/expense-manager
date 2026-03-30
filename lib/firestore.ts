import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import type { BudgetConfig, Category, Expense, ReminderConfig, Spender, Theme } from './types'
import { DEFAULT_CATEGORIES } from './defaultData'

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

function userCol(uid: string, col: string) {
  return collection(getFirebaseDb(), 'users', uid, col)
}

function userDoc(uid: string, col: string, id: string) {
  return doc(getFirebaseDb(), 'users', uid, col, id)
}

async function getAll<T>(uid: string, col: string): Promise<T[]> {
  const snap = await getDocs(userCol(uid, col))
  return snap.docs.map((d) => d.data() as T)
}

// ── Expenses ─────────────────────────────────────────────────────────────────

export async function fsGetExpenses(uid: string): Promise<Expense[]> {
  return getAll<Expense>(uid, 'expenses')
}

export async function fsSetExpenses(uid: string, expenses: Expense[]): Promise<void> {
  const snap = await getDocs(userCol(uid, 'expenses'))
  const batch = writeBatch(getFirebaseDb())
  snap.docs.forEach((d) => batch.delete(d.ref))
  expenses.forEach((e) => batch.set(userDoc(uid, 'expenses', e.id), stripUndefined(e)))
  await batch.commit()
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function fsGetCategories(uid: string): Promise<Category[]> {
  return getAll<Category>(uid, 'categories')
}

export async function fsSetCategories(uid: string, categories: Category[]): Promise<void> {
  const snap = await getDocs(userCol(uid, 'categories'))
  const batch = writeBatch(getFirebaseDb())
  snap.docs.forEach((d) => batch.delete(d.ref))
  categories.forEach((c) => batch.set(userDoc(uid, 'categories', c.id), c))
  await batch.commit()
}

// ── Spenders ─────────────────────────────────────────────────────────────────

export async function fsGetSpenders(uid: string): Promise<Spender[]> {
  return getAll<Spender>(uid, 'spenders')
}

export async function fsSetSpenders(uid: string, spenders: Spender[]): Promise<void> {
  const snap = await getDocs(userCol(uid, 'spenders'))
  const batch = writeBatch(getFirebaseDb())
  snap.docs.forEach((d) => batch.delete(d.ref))
  spenders.forEach((s) => batch.set(userDoc(uid, 'spenders', s.id), stripUndefined(s)))
  await batch.commit()
}

// ── Settings (theme + reminder) ───────────────────────────────────────────────

interface CloudSettings {
  theme?: Theme
  reminder?: ReminderConfig
  migrated?: boolean
  budget?: BudgetConfig
}

export async function fsGetSettings(uid: string): Promise<CloudSettings> {
  const snap = await getDocs(collection(getFirebaseDb(), 'users', uid, 'settings'))
  const settingsDoc = snap.docs.find((d) => d.id === 'data')
  return settingsDoc ? (settingsDoc.data() as CloudSettings) : {}
}

export async function fsSetSettings(uid: string, settings: CloudSettings): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'users', uid, 'settings', 'data'), settings, { merge: true })
}

// ── Seed default categories for new users ─────────────────────────────────────

export async function fsSeedDefaultCategories(uid: string): Promise<void> {
  const batch = writeBatch(getFirebaseDb())
  DEFAULT_CATEGORIES.forEach((c) => batch.set(userDoc(uid, 'categories', c.id), c))
  await batch.commit()
}

// ── Seed default spender for new users ────────────────────────────────────────

export async function fsSeedDefaultSpender(uid: string, spender: Spender): Promise<void> {
  await setDoc(userDoc(uid, 'spenders', spender.id), spender)
}
