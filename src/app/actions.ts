'use server'
import { auth, signIn, signOut, unstable_update } from "@/auth"
import bcrypt from "bcryptjs"
import { getUser, updateUser } from "@/server/data"
import { validateName, validatePasswordChange } from "@/app/utils/profile"
import { AuthError } from "next-auth"

export async function getMapStyles(){
	return `https://api.maptiler.com/maps/streets/style.json?key=${process.env.MAP_KEY}`
}

export async function authenticate(
	prevState: string | undefined,
	formData: FormData
) {
	try {
		await signIn("credentials", formData)
	} catch (error) {
		if (error instanceof AuthError) {
			// "rate_limited" lo lanza authorize() tras demasiados intentos fallidos
			if ((error as { code?: string }).code === "rate_limited") return "rate_limited"
			return "Invalid credentials."
		}
		throw error
	}
}
export async function logOut() {
	try {
		await signOut()
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				default:
					return "Some error."
			}
		}
		throw error
	}
}
export async function getSession() {
	try {
		await auth()
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				default:
					return "Some error."
			}
		}
		throw error
	}
}

export type ProfileResult = { ok: true } | { ok: false, error: 'nameRequired' | 'passwordMin' | 'passwordMax' | 'passwordMismatch' | 'wrongPassword' | 'genericError' }

export async function updateProfileName(name: string): Promise<ProfileResult> {
	const session = await auth()
	const email = session?.user?.email
	if (!email) return { ok: false, error: 'genericError' }
	const error = validateName(name)
	if (error) return { ok: false, error }
	const user = await getUser(email)
	if (!user) return { ok: false, error: 'genericError' }
	await updateUser(user.id, { name: name.trim() })
	await unstable_update({ user: { name: name.trim() } })
	return { ok: true }
}

export async function changeOwnPassword(current: string, next: string, confirm: string): Promise<ProfileResult> {
	const session = await auth()
	const email = session?.user?.email
	if (!email) return { ok: false, error: 'genericError' }
	const error = validatePasswordChange(next, confirm)
	if (error) return { ok: false, error }
	const user = await getUser(email)
	if (!user) return { ok: false, error: 'genericError' }
	if (!(await bcrypt.compare(current, user.password))) return { ok: false, error: 'wrongPassword' }
	await updateUser(user.id, { password: await bcrypt.hash(next, 12) })
	return { ok: true }
}
