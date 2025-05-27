import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Chỉ cho phép đăng nhập bằng Google
            return account.provider === "google"
        },
        async jwt({ token, user, account }) {
            if (account && user) {
                // Thêm role vào token
                token.role = "user" // Mặc định là user
                // Nếu email là admin thì set role là admin
                if (user.email === process.env.ADMIN_EMAIL) {
                    token.role = "admin"
                }
            }
            return token
        },
        async session({ session, token }) {
            // Thêm role vào session
            session.user.role = token.role
            return session
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    }
})

export { handler as GET, handler as POST } 