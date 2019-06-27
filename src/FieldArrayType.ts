import { ModelConstructorType } from './Form'

type ModelType<T> = T extends ModelConstructorType ? InstanceType<T> : string

type InitialType<T> = Array<ModelType<T>>

export class FieldArrayType<M extends any> {
  type: 'fieldArray'
  initial: InitialType<M>
  model: M
  constructor(
    modelOrInitial: M | InitialType<string>,
    initial?: InitialType<M>
  ) {
    if (Array.isArray(modelOrInitial)) {
      this.initial = modelOrInitial as InitialType<M>
    } else {
      this.model = modelOrInitial
      this.initial = initial || []
    }
  }
}
