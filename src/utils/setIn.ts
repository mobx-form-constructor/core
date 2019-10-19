export const isArrayKey = /\[(\d+)\]/

export function setIn(target: { [key: string]: any }, value: any, depth: string[]) {
  depth.reduce((acc: any, key, index, array) => {
    const isArray = isArrayKey.exec(key)
    if (isArray) {
      key = isArray[1]
    }

    if (array.length - 1 === index) {
      if (typeof value !== 'undefined') {
        acc[key] = value
      } else {
        delete acc[key]
      }
    } else {
      if (isArray && acc.length <= Number(key)) {
        acc[key] = {}
      }

      return acc[key]
    }
  }, target)
}
