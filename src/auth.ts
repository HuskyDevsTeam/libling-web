import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getUser } from "@/server/data"
import { UserDTO } from "./dto"

export const { auth, signIn, signOut, unstable_update } = NextAuth({
	...authConfig,
	providers: [
		credentials({
			async authorize(credentials) {
				const parsedCredentials = z
					.object({ email: z.string().email(), password: z.string().min(6) })
					.safeParse(credentials)

				if (parsedCredentials.success) {
					const { email, password } = parsedCredentials.data
					const user = await getUser(email)
					if (!user) return null
					const passwordsMatch = await bcrypt.compare(password, user.password)
					if (passwordsMatch) return new UserDTO(user)
				}
                console.log("Invalid credentials")
				return null
			},
		}),
	],
})
