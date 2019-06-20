export function getValue(e: any) {
  if (e && e.target) {
    switch (e.target.type) {
      case 'checkbox':
        return e.target.checked

      case 'select-multiple': {
        const value = []

        if (e.target.options) {
          for (const option of e.target.options) {
            if (option.selected) {
              value.push(option.value)
            }
          }
        }

        return value
      }

      default:
        return e.target.value
    }
  } else {
    return e
  }
}
