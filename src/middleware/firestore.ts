import { initializeApp } from 'npm:firebase/app'
import { getFirestore, doc, getDoc, addDoc, collection as col, DocumentReference, CollectionReference } from 'firestore'

import { Collections, CollectionMap } from '~/types/mod.ts'

const [apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, projectRoot] = Deno.env.get('FIREBASE')?.split('~') || []
if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId || !projectRoot) throw new Error('missing firebase keys')

const firebase = initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId })

const firestore = getFirestore(firebase)

export const document = <T extends Collections> (...path: [T, ...string[]]) => doc(firestore, projectRoot, ...path) as DocumentReference<CollectionMap[T]>

export const collection = <T extends Collections> (...path: [T, ...string[]]) => col(firestore, projectRoot, ...path) as CollectionReference<CollectionMap[T]>

export const findDocument = <T extends Collections> (...path: [T, ...string[]]) => getDoc(document<T>(...path))

export const addDocument = <T extends Collections> (data: CollectionMap[T], ...path: [T, ...string[]]) => addDoc(collection<T>(...path), data)

export { getDocs, query, where, limit, limitToLast, DocumentReference } from 'firestore'
