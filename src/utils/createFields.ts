import { IModel, IFieldConfig } from '../interfaces'
import { Form } from '../Form'
import { Field } from '../Field'
import { $fields, FieldArray, IFieldArrayConfig } from '..'

import { setIn } from './setIn'

export function createFields(
  model: IModel,
  initialValues: any,
  form: Form,
  $depth: string[] = []
) {
  const fields = {}

  for (const fieldName in model[$fields]) {
    if (Object.hasOwnProperty.call(model[$fields], fieldName)) {
      const depth = fieldName ? $depth.concat(fieldName) : $depth

      const field: any = model[$fields][fieldName]
      field.value = model[fieldName]

      if (initialValues) {
        const value = fieldName ? initialValues[fieldName] : initialValues
        if (value !== undefined) {
          field.value = value
        } else {
          initialValues[fieldName] = field.value
        }
      }

      if (
        typeof model[fieldName] === 'object' &&
        !Array.isArray(model[fieldName])
      ) {
        fields[fieldName] = createFields(
          model[fieldName],
          field.value,
          form,
          depth
        )
      } else {
        if (field.type === 'field') {
          if (typeof field.value === 'undefined') {
            field.value = ''
          }
          setIn(form.values, field.value, depth)
          fields[fieldName] = new Field(field as IFieldConfig, form, depth)
        }

        if (field.type === 'fieldArray') {
          if (typeof field.value === 'undefined') {
            field.value = []
          }
          setIn(form.values, field.value, depth)
          fields[fieldName] = new FieldArray(
            field as IFieldArrayConfig,
            form,
            depth
          )
        }
      }
    }
  }

  return fields
}
