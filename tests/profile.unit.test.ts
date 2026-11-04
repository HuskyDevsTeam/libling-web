import { describe, expect, it } from 'vitest'
import { userInitial, validateName, validatePasswordChange } from '@/app/utils/profile'

describe('profile utils', () => {
	it('userInitial usa nombre, luego email', () => {
		expect(userInitial('lidiz', 'a@b.c')).toBe('L')
		expect(userInitial('  ', 'a@b.c')).toBe('A')
		expect(userInitial(null, null)).toBe('?')
	})
	it('validateName', () => {
		expect(validateName('  ')).toBe('nameRequired')
		expect(validateName('Ana')).toBeUndefined()
	})
	it('validatePasswordChange', () => {
		expect(validatePasswordChange('short', 'short')).toBe('passwordMin')
		expect(validatePasswordChange('longenough1', 'other')).toBe('passwordMismatch')
		expect(validatePasswordChange('longenough1', 'longenough1')).toBeUndefined()
	})
})
