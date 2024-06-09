export const toUtf8 = (input: string): string => {
  const bytes = new Uint8Array(input.split('').map(char => char.charCodeAt(0)))

  return new TextDecoder('utf-8').decode(bytes)
}
