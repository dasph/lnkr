import type { Ip } from '~/types/mod.ts'
import { DocumentReference, Timestamp, addDocument, collection, getDocs, limit, query, updateDoc, where } from '~/middleware/mod.ts'

export const getIp = async (value: number): Promise<DocumentReference<Ip>> => {
  const lastActive = new Date(new Date().setHours(0, 0, 0, 0))

  const { empty, docs } = await getDocs(query(collection('ips'), where('value', '==', value), limit(1)))

  if (empty) return addDocument({ value, lastActive, createdAt: new Date() }, 'ips')

  if ((docs[0].data().lastActive as unknown as Timestamp).toMillis() !== lastActive.valueOf()) updateDoc(docs[0].ref, { lastActive })

  return docs[0].ref
}
