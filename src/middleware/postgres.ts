import { Client } from 'postgres'

const key = Deno.env.get('POSTGRES')
if (!key) throw new Error('no postgres key defined')

export const postgres = new Client(key)

await postgres.connect()
