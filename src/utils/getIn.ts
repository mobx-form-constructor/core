import { isArrayKey } from './setIn'

export function getIn(target: { [key: string]: any }, depth: string[]) {
  let result = target

  for (let key of depth) {
    const isArray = isArrayKey.exec(key)

    if (isArray) {
      key = isArray[1]
    }

    if (typeof result === 'undefined') {
      return
    }

    result = result[key]
  }

  return result
}
