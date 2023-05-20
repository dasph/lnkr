const MIN_COLUMN_WIDTH = 8

export const createTable = (data: Record<string, string | number>[]) => {
  const headerEntries = [...data.reduce<Set<string>>((ctx, curr) => {
    Object.keys(curr).map((key) => ctx.add(key))
    return ctx
  }, new Set()).values()]

  const columns = headerEntries.map((value) => ({
    value,
    width: data.reduce((ctx, curr) => {
      const { length } = `${curr[value]}`
      return length > ctx ? length : ctx
    }, MIN_COLUMN_WIDTH)
  }))

  const h1 = `┌${columns.map(({ width }) => '─'.repeat(Math.ceil(width / 2.0) * 2 + 1)).join('┬')}┐`

  const h2 = `│${columns.map(({ value, width }) => `${' '.repeat(~~((width - value.length - 0.1) / 2 + 1))}${value}${' '.repeat(~~((width - value.length - 0.1) / 2 + 1))}`).join('│')}│`

  const h3 = `├${columns.map(({ width }) => '─'.repeat(Math.ceil(width / 2.0) * 2 + 1)).join('┼')}┤`

  const f0 = `└${columns.map(({ width }) => '─'.repeat(Math.ceil(width / 2.0) * 2 + 1)).join('┴')}┘`

  const body = data.map((entry) => `│${columns.map(({ value, width }) => ` ${entry[value]}${' '.repeat(width - `${entry[value]}`.length)}`).join('│')}│`).join('\n')

  return [h1, h2, h3, body, f0].join('\n')
}
