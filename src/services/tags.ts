import type { Tag } from '~/types/mod.ts'

import { postgres } from '~/middleware/mod.ts'

type TagLinkProps = {
  linkId: number
  tags: string[]
  userId: string
}

export const tagLink = async ({ linkId, tags, userId }: TagLinkProps): Promise<void> => {
  if (!tags.length) return

  const indexes = tags.map((_, index, { length }) => `($${index + 1}, $${length + 1})`).join(', ')

  await postgres.queryObject(`insert into tags (value, "userId") values ${indexes} on conflict ("userId", value) do nothing`, [...tags, userId])

  const { rows } = await postgres.queryObject<Pick<Tag, 'id'>>(`select id from tags where "userId" = $1 and value = any ($2)`, [userId, tags])

  await postgres.queryObject(`insert into linktags (tag, link) values ${indexes}`, [...rows.map(({ id }) => id), linkId])
}
