import { Form } from '../Form'
import { $fields } from '../decorators'

export interface IFormConfig<T, R extends any = {}> {
  onSubmit?: (form: Form<T>) => Promise<R>
  onSubmitSuccess?: (result: R, form: Form<T>) => any
  onSubmitFail?: (error: R, form: Form<T>) => any
  initialValues?: Partial<T>
  didChange?: (form: Form<T>) => any
}

export interface IModel {
  [$fields]: any
}
