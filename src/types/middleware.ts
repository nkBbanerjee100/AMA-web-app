
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
export { default } from "next-auth/middleware" // i'm running this middleware everywhere
import { getToken } from "next-auth/jwt"
const secret = process.env.NEXT_AUTH_SECRET;
export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: secret })
    const url = request.nextUrl

    if (token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify') ||
        url.pathname.startsWith('/')
    )) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (!token && url.pathname.startsWith('/dashboard'))
        return NextResponse.redirect(new URL('/sign-in', request.url))
    return NextResponse.next()
}

// Where I want this middleware to run
export const config = {
    matcher: [
        '/sign-in',
        '/dashboard/:path*', //  Matches /dashboard/anything (but not /dashboard), the :path part is called a param and * means any path  
        '/',
        '/verify/:path*'
    ],
}