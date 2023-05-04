import type { DocumentReference } from 'firestore'

export type Collections = 'refs' | 'links' | 'hits'

export type Ref = {
  value: string
  createdAt: Date
}

export type Link = {
  alias: string
  value: string
  ref: DocumentReference<Ref>
  createdAt: Date
}

export type Hit = {
  ip: number
  link: DocumentReference<Link>
  createdAt: Date
}

export type CollectionMap = {
  refs: Ref
  hits: Hit
  links: Link
}
