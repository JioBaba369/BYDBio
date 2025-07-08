
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Handle legacy /o/:id routes and redirect them to the canonical /job/:id path
  if (pathname.startsWith('/o/')) {
    const id = pathname.split('/')[2]
    if (id) {
      const newUrl = request.nextUrl.clone()
      newUrl.pathname = `/job/${id}`
      return NextResponse.redirect(newUrl)
    }
  }

  // Handle legacy /opportunities/:id routes and redirect them to the canonical /job/:id path
  if (pathname.startsWith('/opportunities/')) {
    const newPath = pathname.replace('/opportunities', '/job')
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = newPath
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

// This specifies that the middleware should only run for paths starting with /o/ or /opportunities/
export const config = {
  matcher: ['/o/:path*', '/opportunities/:path*'],
}
