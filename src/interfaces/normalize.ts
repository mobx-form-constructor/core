import { Field } from '../Field'

export type NormalizeType<T, M> = (value: T, field: Field<T, M>) => T
