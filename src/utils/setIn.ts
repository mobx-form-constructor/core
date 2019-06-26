export const isArrayKey = /\[(\d+)\]/

export function setIn(
  target: { [key: string]: any },
  value: any,
  depth: string[]
) {
  depth.reduce((acc: any, key, index, array) => {
    const result = isArrayKey.exec(key)

    if (result) {
      key = result[1]
    }

    if (array.length - index === 1) {
      if (typeof value !== 'undefined') {
        acc[key] = value
      } else {
        delete acc[key]
      }
    } else {
      if (result && !acc[key]) {
        acc[key] = {}
      }

      return acc[key]
    }
  }, target)
}
