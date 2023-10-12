import { PrismaClient } from '@prisma/client'
import { getLoginRedirect } from '~/utils/auth'
import { getAuth0Claims, getTXOsteoJWTClaims } from '~/utils/jwt'

type PathFilter = {
  path: string | RegExp
  methods?: string[] // GET by default
}

/**
 * Paths that do not require authentication.
 * Strings are only allowed if it is an exact match
 */
const publicPaths: PathFilter[] = [
  { path: /^\/api\/auth\/.+/, methods: ['GET', 'POST'] },
  { path: '/' },
]

/**
 * Ideally, this client will be used by every API endpoint by using
 * "event.context.prisma" instead of making a new instance every time
 */
const prismaClient = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Add reference to prisma client for easy access later
  event.context.prisma = prismaClient

  // Get tokens from cookies, verify them, and cache their results in the context
  const auth0Cookie = getCookie(event, useRuntimeConfig().public.auth0_token)
  const auth0Claims = auth0Cookie ? getAuth0Claims(auth0Cookie) : null
  event.context.auth0Claims = auth0Claims

  const osteoCookie = getCookie(event, useRuntimeConfig().public.txosteo_token)
  const txOsteoClaims = osteoCookie ? getTXOsteoJWTClaims(osteoCookie) : null
  event.context.txOsteoClaims = txOsteoClaims

  const currentUrl = getRequestURL(event)

  // Skip authentication if the path matches a public path filter
  if (
    publicPaths.some((p) => comparePaths(event.method, p, currentUrl.pathname))
  ) {
    return
  }

  // If no Auth0 claims, they're unauthenticated
  if (!auth0Claims) {
    // Throw an error if they are trying to access an endpoint.
    // Redirect them if they are trying to reach a page
    if (currentUrl.pathname.startsWith('/api')) {
      throw createError({
        statusCode: 401,
        statusMessage: `You are unauthorized to access this endpoint: ${currentUrl.pathname}`,
      })
    } else if (!txOsteoClaims) {
      // TODO: Send them to new user page
      await sendRedirect(event, getLoginRedirect(event))
    } else {
      await sendRedirect(event, getLoginRedirect(event))
    }
  }
})

function comparePaths(
  method: string,
  pathFilter: PathFilter,
  currentPath: string,
): boolean {
  if (
    (pathFilter.path instanceof RegExp && pathFilter.path.test(currentPath)) ||
    currentPath === pathFilter.path
  ) {
    // Allow GET request through unless specified
    if (!pathFilter.methods && method === 'GET') return true
    if (pathFilter.methods && pathFilter.methods.includes(method)) return true
  }
  return false
}