import { Field } from '../Field'
import { FieldArray } from '../FieldArray'
import { FieldArrayType } from '../FieldArrayType'

import { ValidateType } from './validate'
import { NormalizeType } from './normalize'

export interface IFieldConfig<T = any, M = any> {
  value: T
  validate?: Array<ValidateType<T, M>> | ValidateType<T, M>
  normalize?: Array<NormalizeType<T, M>> | NormalizeType<T, M>
  didChange?: (value: T, field: Field<T, M>) => any
  didFocus?: (field: Field<T, M>) => any
  didBlur?: (field: Field<T, M>) => any
}

export type ValuesType<T> = {
  [P in keyof T]: T[P] extends FieldArrayType<any> ? T[P]['initial'] : T[P]
}

export type FieldsType<T> = {
  [P in keyof T]: T[P] extends FieldArrayType<any>
    ? FieldArray<T[P]['initial'][0], T>
    : Field<T[P], T>
}

export type ErrorsType<T> = {
  [P in keyof T]: T[P] extends object | any[] ? ErrorsType<T[P]> : string
}
