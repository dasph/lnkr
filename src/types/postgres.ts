import type { Point } from 'postgres/types'

export type User = {
  id: string
  name: string
  createdAt: Date
}

export type Passkey = {
  id: string
  key: Uint8Array
  counter: bigint
  transports: string
  userId: string
  createdAt: Date
  lastUsedAt: Date
}

export type Tag = {
  id: string
  value: string
  userId: string
  createdAt: Date
}

export type Ip = {
  id: string
  contry: string
  location: Point
  updatedAt: Date
  createdAt: Date
}

export type Link = {
  id: number
  value: string
  userId: string
  createdAt: Date
}

export type Hit = {
  ip: string
  link: number
  createdAt: Date
}

export type LinkTag = {
  tag: string
  link: number
  createdAt: Date
}
