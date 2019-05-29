import { Field } from '../Field'
import { FieldArray } from '../FieldArray'
import DefaultModel from '../Default.model'
import { FieldsType } from '../interfaces'

export type ValidatorsType = Array<() => Promise<boolean> | boolean>

export function composeValidators(
  fields: FieldsType<any>,
  validators: ValidatorsType = []
) {
  for (const key in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      const field = fields[key]

      if (field instanceof Field) {
        validators.push(field.validate)
      }

      if (field instanceof FieldArray) {
        validators.push(field.validate)
        if (field.model instanceof DefaultModel) {
          for (const f of field.value) {
            validators.push(f[''].validate)
          }
        } else {
          for (const f of field.value) {
            validators.push(...composeValidators(f as FieldsType<any>))
          }
        }
      }
    }
  }

  return validators
}
