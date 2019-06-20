import { Form } from '../Form'
import { $fields } from '../decorators'

export interface IFormConfig<T, R extends any = {}> {
  onSubmit?: (form: Form<T>) => Promise<R>
  onSubmitSuccess?: (result: R, form: Form<T>) => any
  onSubmitFail?: (error: R, form: Form<T>) => any
  initialValues?: Partial<T>
  didChange?: (key: string, value: any, form: Form<T>) => any
  name?: string
}

export interface IModel {
  [$fields]: any
  [key: string]: any
}
