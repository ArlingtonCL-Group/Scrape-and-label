'use server'
import {withAuth} from "next-auth/middleware"
import {NextResponse} from 'next/server';


export default withAuth(
// `withAuth` augments your `Request` with the user's token.
async function middleware(req) {
    console.log("clg middleware working")
    const url = req
        .nextUrl
        .clone()
    const isAuthenticated = !!(req
        ?.nextauth
            ?.token);
    const isPublicRoute = req.nextUrl.pathname.startsWith('/webapps/anivoice/login');
    const isAdminRoute = req.nextUrl.pathname.startsWith('/webapps/anivoice/api/admin') || req.nextUrl.pathname.startsWith('/webapps/anivoice/admin');
    if (!isAuthenticated && !isPublicRoute) {
        console.log(url.pathname, "middleware url pathname before")
        url.pathname = '/login';
        console.log(url.pathname, "middleware url pathname after ")
        return NextResponse.rewrite(url)
    } else if (isAdminRoute && !(['usurper', 'admin'].includes(req?.nextauth?.token?.role as string))) {
        return NextResponse.json({
            error: 'Access Denied'
        }, {status: 403})
    } else {
        return NextResponse.next()
    }
}, {
    callbacks: {
        authorized: async({req, token}) => {
            if (token) {
                return true
            } else {
                return false
            }
        }
    }
},)

export const config = {
    matcher: [/*
       * Match all request paths except for the ones starting with:
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - login (login route)
       */
        '/webapps/anivoice/((?!_next/static|_next/image|favicon.ico|login).*)']
}