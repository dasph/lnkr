import { randomBase64 } from '~/helpers/mod.ts'
import { collection, getDocs, limit, query, where } from '~/middleware/mod.ts'

const callback = async (retry: number): Promise<string> => {
  if (retry > 2) return ''

  const alias = randomBase64(3)

  const { empty } = await getDocs(query(collection('links'), where('alias', '==', alias), limit(1)))

  return empty ? alias : callback(retry + 1)
}

export const getUniqueAlias = (): Promise<string> => callback(0)
