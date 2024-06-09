import { postgres } from '~/middleware/mod.ts'

type HitProps = {
  ip: string
  town: string
  country: string
  location: string
  linkId: number
}

export const hit = async ({ ip, country, town, location, linkId }: HitProps): Promise<void> => {
  await postgres.queryObject(
    `insert into ips (id, country, town, location) values ($1, $2, $3, $4) on conflict (id) do update set country = $2, town = $3, location = $4, "updatedAt" = $5`,
    [ip, country, town, location, new Date()]
  )

  postgres.queryObject(`insert into hits (ip, link) values ($1, $2)`, [ip, linkId])
}
