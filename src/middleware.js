import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAdminRoute = req.nextUrl.pathname.startsWith("/api/admin")
        const isUserRoute = req.nextUrl.pathname.startsWith("/api/user")

        // Kiểm tra quyền truy cập API admin
        if (isAdminRoute && token?.role !== "admin") {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 403 }
            )
        }

        // Kiểm tra quyền truy cập API user
        if (isUserRoute && !token) {
            return NextResponse.json(
                { error: "Vui lòng đăng nhập" },
                { status: 401 }
            )
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    matcher: ["/api/admin/:path*", "/api/user/:path*"]
} 