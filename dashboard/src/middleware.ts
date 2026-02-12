import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const role = request.cookies.get('role')?.value
  const pathname = request.nextUrl.pathname

  console.log(`[Middleware] Path: ${pathname} | Role: ${role} | Token: ${!!token}`)

  const isLoginPage = pathname === '/login'
  const isInvoicePage = pathname.startsWith('/invoice/')
  const isApplyPage = pathname === '/apply'

  if (!token && !isLoginPage && !isInvoicePage && !isApplyPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }


  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname === '/') {
    const userRole = role?.toLowerCase()
    if (userRole === 'student') {
      return NextResponse.redirect(new URL('/student', request.url))
    }
    if (userRole === 'parent') {
      return NextResponse.redirect(new URL('/parent', request.url))
    }
    if (userRole === 'coach') {
      return NextResponse.redirect(new URL('/coach', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    const userRole = role?.toLowerCase()
    if (userRole !== 'admin') {
      return NextResponse.rewrite(new URL('/404', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
