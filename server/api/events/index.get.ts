import { extendWithHiddenEventCodes } from '~/utils/prisma-parsing'
import { getRealRequestURL } from '~/utils/server'

/**
 * --- API INFO
 * GET /api/events
 * Returns a list of all events
 * --- QUERY PARAMETERS
 * ?after={DATE} - Returns only events after this date
 * ?before={DATE} - Returns only events before this date
 */

export default defineEventHandler(async (event) => {
  const url = getRealRequestURL(event)

  // If the param is not null, attempt to parse it as a number then as a string
  const afterDateParam = url.searchParams.get('after')
  const afterDate = afterDateParam
    ? new Date(Number(afterDateParam) || afterDateParam)
    : undefined

  const beforeDateParam = url.searchParams.get('before')
  const beforeDate = beforeDateParam
    ? new Date(Number(beforeDateParam) || beforeDateParam)
    : undefined

  const prisma = extendWithHiddenEventCodes(event)

  // Find every event by providing no search filters
  const data = await prisma.event.findMany({
    where: {
      dateAndTime: {
        gte: afterDate,
        lte: beforeDate,
      },
    },
    include: {
      positions: {
        include: {
          prerequisites: true,
        },
      },
    },
  })
  return data
})
