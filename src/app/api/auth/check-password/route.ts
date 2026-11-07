import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { headers } from "next/headers"
import { getUserById } from "@/server/data"

export async function POST(request: NextRequest) {
	try {
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
			if(typeof isTokenValid !== 'string'){
				const { data } = isTokenValid
	
				console.log(data)
				const userFind = await getUserById(data.id)
	
				// Validamos que exista el usuario
				if (!userFind) {
					return NextResponse.json({ message: "No user found" }, { status: 400 })
				}
	
				return NextResponse.json(
					{ message: 'link verified' },
					{ status: 200 }
				)
			}
		} catch (error) {
			return NextResponse.json(
				{ message: 'token not valid', error },
				{ status: 400 }
			)
		}
	} catch {
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        )
        
    }
}
