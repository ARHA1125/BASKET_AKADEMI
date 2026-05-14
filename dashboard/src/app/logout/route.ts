import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
  response.cookies.set('role', '', { path: '/', maxAge: 0 });

  return response;
}
