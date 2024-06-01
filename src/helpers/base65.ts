const table: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '-', '_', '~'
]

const radix = table.length

const map = Object.fromEntries(table.map((char, index) => [char, index]))

export const encode65 = (value: number): string => {
  let result = ''

  while (value > 0) {
    result = table[value % radix] + result
    value = ~~(value / radix)
  }

  return result
}

export const decode65 = (value: string): number => value.split('').reduce<number>((ctx, curr) => ctx * radix + map[curr], 0)

export const radix65 = radix
