import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
        keep_logged_in: { label: "Keep Logged In", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
        
        try {
          const res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
              keep_logged_in: credentials.keep_logged_in === "true",
            }),
          });

          const response = await res.json();

          if (res.ok && response.data?.user) {
            // Return user object along with tokens
            return {
              id: response.data.user.id,
              name: `${response.data.user.first_name} ${response.data.user.last_name}`,
              email: response.data.user.email,
              username: response.data.user.username,
              accessToken: response.data.tokens.access_token,
              refreshToken: response.data.tokens.refresh_token,
            } as any;
          }
          
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "fallback-secret-do-not-use-in-production",
});
