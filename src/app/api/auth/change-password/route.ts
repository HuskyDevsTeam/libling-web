import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { headers } from "next/headers"
import { getUserById, updateUser } from "@/services"
import bcrypt from "bcryptjs"

interface IBodyProps {
	password: string
	passwordConfirmation: string
}
export async function POST(request: NextRequest) {
	try {
		const body: IBodyProps = await request.json()

		const { password, passwordConfirmation } = body

		// Validamos que esten todos los campos
		if (!password || !passwordConfirmation) {
			return NextResponse.json(
				{ message: "faltan propiedades en la request" },
				{ status: 422 }
			)
		}
		const headersList = await headers()
		const token = headersList.get("token")
		if (!token) {
			return NextResponse.json(
				{
					message: "no authorized",
				},
				{
					status: 400,
				}
			)
		}

		try {
			const isTokenValid = jwt.verify(token, "secreto")

			if (typeof isTokenValid !== "string") {
				const { data } = isTokenValid

				console.log(data)
				const userFind = await getUserById(data.id)

				// Validamos que exista el usuario
				if (!userFind) {
					return NextResponse.json(
						{ message: "No user found" },
						{ status: 400 }
					)
				}
				if (password !== passwordConfirmation) {
					return NextResponse.json(
						{ message: "passwords are different" },
						{ status: 422 }
					)
				}
				const hashedPassword = await bcrypt.hash(password, 12)
				await updateUser(userFind.id, { password: hashedPassword })

				return NextResponse.json(
					{ message: "password changed!" },
					{ status: 200 }
				)
			}
		} catch (error) {
			return NextResponse.json(
				{ message: "token not valid", error },
				{ status: 400 }
			)
		}
	} catch {
		return NextResponse.json({ message: "Server error" }, { status: 500 })
	}
}
