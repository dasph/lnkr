import { connect } from 'redis'

const hostname = Deno.env.get('REDIS_HOSTNAME')
if (!hostname) throw new Error('no redis hostname defined')

export const redis = await connect({ hostname })
