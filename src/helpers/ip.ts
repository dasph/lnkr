export const compressIP = (value: string): number => {
  const q = value.split('.').map((n) => +n)

  if (q.length !== 4) throw new Error('IP is invalid')
  if (q.some((Number.isNaN))) throw new Error('IP is NaN')
  if (q.some((val) => val < 0 || val > 255)) throw new Error('IP is invalid')

  return q.reduce<number>((ctx, curr, i) => ctx + (curr << (i * 8)), 0)
}

export const decompressIP = (value: number): string => {
  return [...Array(4)].map((_, index) => (value >> index * 8) & 0xff).join('.')
}
