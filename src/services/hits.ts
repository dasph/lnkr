import { postgres } from '~/middleware/mod.ts'

type HitProps = {
  ip: string
  country: string
  location: string
  linkId: number
}

export const hit = async ({ ip, country, location, linkId }: HitProps): Promise<void> => {
  await postgres.queryObject(
    `insert into ips (id, country, location) values ($1, $2, $3) on conflict (id) do update set country = $2, location = $3, "updatedAt" = $4`,
    [ip, country, location, new Date()]
  )

  postgres.queryObject(`insert into hits (ip, link) values ($1, $2)`, [ip, linkId])
}
