export function required({ value }: any) {
  return !value ? 'Required' : ''
}

export function trim() {
  return (value: any) => value.trim()
}

export function minLength(length: number) {
  return ({ value }: any) =>
    value.length < length ? `Min length ${length}` : ''
}
