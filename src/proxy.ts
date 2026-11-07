import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"


// -> 'en-US'

let locales = ["en", "fr", "es"]
// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest) {
	const selectedLanguage = request.cookies.get("NEXT_LOCALE")?.value
	if (
		selectedLanguage &&
		locales.includes(selectedLanguage.toLocaleLowerCase())
	) {
		return selectedLanguage
	}
	let headers = {
		"accept-language":
			request.headers.get("accept-language") || "en-US,en;q=0.5",
	}
	// "*" (comodin de Accept-Language) no es una etiqueta valida y hace que match() lance un RangeError
	const languages = new Negotiator({ headers })
		.languages()
		.filter((language) => language !== "*")
	const defaultLocale = "en"
	try {
		return match(languages, locales, defaultLocale)
	} catch {
		return defaultLocale
	}
}

export async function proxy(request: any, response: any) {
	// Check if there is any supported locale in the pathname
	const { pathname } = request.nextUrl
	const pathnameHasLocale = locales.some(
		(locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	)

	if (!pathnameHasLocale) {
		// Redirect if there is no locale
		const locale = getLocale(request)
		request.nextUrl.pathname = `/${locale}${pathname}`
		// e.g. incoming request is /products
		// The new URL is now /en-US/products
		return Response.redirect(request.nextUrl)
	}
	if (
		request.nextUrl.pathname.includes("/admin") ||
		request.nextUrl.pathname.includes("/auth")
	) {
		return await auth(request, response)
	}
}

export const config = {
	matcher: [
		// Skip all internal paths (_next)
		// "/((?!_next).*)",
		// Optional: only run on root (/) URL
		// '/'
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - sitemap.xml (sitemap file)
		 * - robots.txt (sitemap file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
}
