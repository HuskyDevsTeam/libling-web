export const MIN_PASSWORD_LENGTH = 8

export function validateName(name: string): 'nameRequired' | undefined {
	return name.trim().length === 0 ? 'nameRequired' : undefined
}

export function validatePasswordChange(next: string, confirm: string): 'passwordMin' | 'passwordMismatch' | undefined {
	if (next.length < MIN_PASSWORD_LENGTH) return 'passwordMin'
	if (next !== confirm) return 'passwordMismatch'
	return undefined
}

// Initial shown in the avatar: first letter of the name, falling back to the email.
export function userInitial(name?: string | null, email?: string | null): string {
	const source = (name?.trim() || email?.trim() || '').charAt(0)
	return source ? source.toUpperCase() : '?'
}
