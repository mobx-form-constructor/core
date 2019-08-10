import { Field } from '../Field'
import { FieldArray } from '../FieldArray'
import { FieldArrayType } from '../FieldArrayType'
import { ModelConstructorType } from '../Form'

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
  [P in keyof T]: T[P] extends FieldArrayType<infer M>
    ? M extends ModelConstructorType
      ? Array<ValuesType<InstanceType<M>>>
      : M
    : T[P]
}

export type FieldsType<T> = {
  [P in keyof T]: T[P] extends FieldArrayType<infer M>
    ? M extends ModelConstructorType
      ? FieldArray<InstanceType<M>>
      : FieldArray<M[0], T>
    : Field<T[P], T>
}

export type ErrorsType<T> = {
  [P in keyof T]: T[P] extends FieldArrayType<infer M>
    ? Array<M extends ModelConstructorType ? ErrorsType<InstanceType<M>> : string>
    : string
}

export interface IFieldArrayConfig<T = any, M = any> {
  model: ModelConstructorType
  value: any[]
  validate?: Array<ValidateType<T, M>> | ValidateType<T, M>
}
