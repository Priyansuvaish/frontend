import NextAuth from "next-auth/next";
import KeycloakProvider from "next-auth/providers/keycloak";
import { Session } from "next-auth";

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!||"leave_application",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!||"http://localhost:8081/realms/LeaveApplication",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Send access_token to the client
      (session as Session & { accessToken?: string; id_token?: string }).accessToken = token.accessToken as string;
      (session as Session & { accessToken?: string; id_token?: string }).id_token = token.id_token as string;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST }; 