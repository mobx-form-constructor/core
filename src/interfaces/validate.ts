import { Field } from '../Field'
import { FieldArray } from '../FieldArray'

export type ValidateType<T = any, M = any> = (
  field: Field<T, M> | FieldArray<T, M>
) => Promise<string | undefined> | string | undefined
