import "server-only"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getUser } from "@/server/data"

export class UnauthorizedError extends Error {
	constructor() {
		super("Unauthorized")
		this.name = "UnauthorizedError"
	}
}

/**
 * Exige una sesion de administrador valida. Se llama al principio de CADA accion de servidor
 * o ruta que modifique o lea datos privados: el proxy y el layout del admin no son una
 * barrera suficiente (las acciones de servidor se pueden invocar con un POST directo).
 * Devuelve el usuario de la sesion tal como existe en la base de datos.
 */
export async function requireAdmin() {
	const session = await auth()
	const email = session?.user?.email
	if (!email) throw new UnauthorizedError()
	const user = await getUser(email)
	if (!user) throw new UnauthorizedError()
	return { id: user.id, email: user.email, name: user.name }
}

/** Version para paginas y layouts del servidor: redirige al login en lugar de lanzar. */
export async function requireAdminPage(lang: string) {
	try {
		return await requireAdmin()
	} catch (e) {
		if (e instanceof UnauthorizedError) redirect(`/${lang}/auth/login`)
		throw e
	}
}
