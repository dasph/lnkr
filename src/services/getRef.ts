import type { Ref } from '~/types/mod.ts'
import { DocumentReference, addDocument, collection, getDocs, limit, query, where } from '~/middleware/mod.ts'

export const getRef = async (value: string): Promise<DocumentReference<Ref>> => {
  const { empty, docs } = await getDocs(query(collection('refs'), where('value', '==', value), limit(1)))

  return !empty ? docs[0].ref : addDocument<'refs'>({ value, createdAt: new Date() }, 'refs')
}
