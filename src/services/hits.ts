import { postgres } from '~/middleware/mod.ts'

type HitProps = {
  ip: string
  linkId: number
}

export const hit = async ({ ip, linkId }: HitProps): Promise<void> => {
  await postgres.queryObject(`insert into ips (id) values ($1) on conflict (id) do nothing`, [ip])

  postgres.queryObject(`insert into hits (ip, link) values ($1, $2)`, [ip, linkId])
}
