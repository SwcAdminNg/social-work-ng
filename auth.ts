import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

class CustomAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
        keep_logged_in: { label: "Keep Logged In", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

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
            return {
              id: response.data.user.id,
              name: `${response.data.user.first_name} ${response.data.user.last_name}`,
              email: response.data.user.email,
              username: response.data.user.username,
              accessToken: response.data.tokens.access_token,
              refreshToken: response.data.tokens.refresh_token,
              expiresAt: Math.floor(Date.now() / 1000) + (response.data.tokens.expires_in || 3600),
            } as any;
          }

          throw new CustomAuthError(
            response.message || "Invalid credentials provided",
          );
        } catch (error: any) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          console.error("Login error:", error.message);
          throw new CustomAuthError(
            "An unexpected error occurred during login",
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.expiresAt = (user as any).expiresAt;
      } 
      
      // Explicit manual refresh triggered by the client modal
      else if (trigger === "update" && session?.action === "refresh") {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
          const res = await fetch(`${baseUrl}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: token.refreshToken }),
          });
          const response = await res.json().catch(() => ({}));
          
          if (res.ok && response.data?.access_token) {
            token.accessToken = response.data.access_token;
            token.refreshToken = response.data.refresh_token;
            token.expiresAt = Math.floor(Date.now() / 1000) + (response.data.expires_in || 3600);
            token.error = undefined;
          } else {
            token.error = "RefreshAccessTokenError";
          }
        } catch (error) {
          console.error("Error refreshing access token", error);
          token.error = "RefreshAccessTokenError";
        }
      } 
      // If token is expired and NO manual refresh was triggered, flag it as error so client logs out
      else if (token.expiresAt && Math.floor(Date.now() / 1000) > (token.expiresAt as number)) {
        token.error = "RefreshAccessTokenError";
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string;
        (session as any).accessToken = token.accessToken;
        (session as any).expiresAt = token.expiresAt; // Pass expiry time to client
        (session as any).error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "fallback-secret-do-not-use-in-production",
  trustHost: true,
});
