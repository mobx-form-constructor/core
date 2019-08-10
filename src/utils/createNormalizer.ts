import { Field } from '../Field'
import { NormalizeType } from '../interfaces'

export function createNormalizer<T, M>(normalizer?: NormalizeType<T, M> | Array<NormalizeType<T, M>>) {
  return (value: T, field: Field<T, M>) => {
    if (normalizer) {
      const normalizers = Array.isArray(normalizer) ? normalizer : [normalizer]

      let $value: T = value

      for (const fn of normalizers) {
        $value = fn(value, field)
      }

      return $value
    }

    return value
  }
}
