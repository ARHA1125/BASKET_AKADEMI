import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const role = request.cookies.get('role')?.value
  const pathname = request.nextUrl.pathname

  console.log(`[Middleware] Path: ${pathname} | Role: ${role} | Token: ${!!token}`)

  const isLoginPage = pathname === '/login'
  const isInvoicePage = pathname.startsWith('/invoice/')

  if (!token && !isLoginPage && !isInvoicePage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }


  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 3. Root Path Redirection: Handle Role-Based Landing Pages
  if (pathname === '/') {
    const userRole = role?.toLowerCase()
    if (userRole === 'student') {
      return NextResponse.redirect(new URL('/student', request.url))
    }
    if (userRole === 'parent') {
      return NextResponse.redirect(new URL('/parent', request.url))
    }
  }

  // 4. RBAC: Block non-admins from /admin routes
  if (pathname.startsWith('/admin')) {
    const userRole = role?.toLowerCase()
    // If role is missing or not admin, rewrite to 404
    if (userRole !== 'admin') {
      return NextResponse.rewrite(new URL('/404', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.svg (logo file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
