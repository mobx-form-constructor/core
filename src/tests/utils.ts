export function required({ value }: any) {
  const errorMessage = 'Required'

  if (Array.isArray(value)) {
    return !value.length ? errorMessage : ''
  }

  return !value ? errorMessage : ''
}

export function willThrowAnError() {
  return Promise.reject(new Error('Ooops'))
}

export function trim() {
  return (value: any) => value.trim()
}

export function minLength(length: number) {
  return ({ value }: any) => (value.length < length ? `Min length ${length}` : '')
}
