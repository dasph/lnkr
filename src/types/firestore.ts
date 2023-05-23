import type { DocumentReference } from 'firestore'

export type Collections = 'refs' | 'links' | 'hits' | 'ips'

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
  ip: DocumentReference<Ip>
  link: DocumentReference<Link>
  createdAt: Date
}

export type Ip = {
  value: number
  lastActive: Date
  createdAt: Date
}

export type CollectionMap = {
  ips: Ip
  refs: Ref
  hits: Hit
  links: Link
}
