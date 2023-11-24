export function exclude(object: {}, keys: string[]) {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => !keys.includes(key))
  )
}