import type { NextAuthConfig } from "next-auth"

export const authConfig = {
	pages: {
		signIn: "auth/login",
	},
	// maxAge = vida maxima de la cookie (30 dias, con "Recuerdame"). La caducidad real la fija el JWT en auth.ts: 12 h sin "Recuerdame".
	session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
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

