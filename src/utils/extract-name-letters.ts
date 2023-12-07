export function extractNameLetters(name: string) {
  const parts = name.split(' ')

  const firstLetter = parts[0].charAt(0)
  let lastLetter = ''

  if (parts.length !== 1) {
    lastLetter = parts[parts.length - 1].charAt(0)

    return firstLetter + lastLetter
  }

  return firstLetter
}