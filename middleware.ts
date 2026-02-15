import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Check for session token (works with database sessions too)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // For database sessions, check the session cookie directly
    secureCookie: process.env.NODE_ENV === 'production',
  })

  const { pathname } = request.nextUrl

  // If accessing dashboard routes without auth, redirect to signin
  if (pathname.startsWith('/dashboard')) {
    // Check for session cookie directly since we use database sessions
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value

    if (!sessionToken && !token) {
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
