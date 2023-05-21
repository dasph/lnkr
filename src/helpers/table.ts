const MIN_COLUMN_WIDTH = 8

const roundUpEven = (number: number): number => Math.ceil(number / 2.0) * 2

const left = (value: string, length: number): string => {
  const padding = ' '.repeat(length - value.length)
  return ` ${value}${padding}`
}

const center = (value: string, length: number): string => {
  const padding = ' '.repeat(roundUpEven(length - value.length) / 2)
  return `${padding}${value}${padding}`
}

export const createTable = (data: Record<string, string | number>[]) => {
  const headerEntries = [...data.reduce<Set<string>>((ctx, curr) => {
    Object.keys(curr).map((key) => ctx.add(key))
    return ctx
  }, new Set()).values()]

  const columns = headerEntries.map((value) => ({ value, width: Math.max(MIN_COLUMN_WIDTH, ...data.map((entry) => `${entry[value]}`.length)) }))

  return [
    `┌${columns.map(({ width }) => '─'.repeat(roundUpEven(width) + 1)).join('┬')}┐`,
    `│${columns.map(({ value, width }) => center(value, width)).join('│')}│`,
    `├${columns.map(({ width }) => '─'.repeat(roundUpEven(width) + 1)).join('┼')}┤`,

    ...data.map((entry) => `│${columns.map(({ value, width }) => left(`${entry[value]}`, width)).join('│')}│`),

    `└${columns.map(({ width }) => '─'.repeat(roundUpEven(width) + 1)).join('┴')}┘`
  ].join('\n')
}
