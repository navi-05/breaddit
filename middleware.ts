export { default } from "next-auth/middleware"

export const config = { 
  matcher: [
    '/r/:path*/submit', 
    '/r/create'
  ]
}