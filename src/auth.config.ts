import type { NextAuthConfig } from "next-auth"

export const authConfig = {
	pages: {
		signIn: "auth/login",
	},
	// La sesion del panel caduca a las 12 horas (por defecto serian 30 dias)
	session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
    callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.includes('/admin');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/admin/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

