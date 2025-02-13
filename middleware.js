import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in', '/sign-up', '/', '/home'])
const isPublicApiRoute = createRouteMatcher(['/api/video'])

export default clerkMiddleware((auth, req) => {
  const { userId } = auth() 
  const currentUrl = new URL(req.url)
  const isAccessHome = currentUrl.pathname === '/home'
  const isApiRequest = currentUrl.pathname.startsWith('/api')

  // If user is logged in
  if (userId && isPublicRoute(req) && !isAccessHome) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // If user is not logged in and trying to access protected route
  if (!userId) {
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    //   if the req is for protected API and the user is not logged in
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*),"/', '/(api|trpc)(.*)']
}
