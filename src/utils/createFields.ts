import { IModel } from '../interfaces'
import { Form } from '../Form'
import { Field } from '../Field'
import { $fields, FieldArray } from '..'
// import FieldArrayType from '../FieldArrayType'
import DefaultModel from '../Default.model'

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
      const fieldConfig: any = model[$fields][fieldName]

      switch (fieldConfig.type) {
        case 'field': {
          const initial =
            typeof initialValues[fieldName] !== 'undefined'
              ? initialValues[fieldName]
              : model[fieldName] || ''

          model[fieldName] = initial

          if (fieldName) {
            if (!initialValues[fieldName]) {
              initialValues[fieldName] = initial
            }

            if (
              initial ||
              typeof initial === 'boolean' ||
              form.valuesBehavior === 'keepEmpty'
            ) {
              setIn(form.values, initial, depth)
            }
          }

          fields[fieldName] = new Field(
            { ...fieldConfig, value: initial },
            form,
            depth
          )

          break
        }

        case 'fieldArray': {
          // const fieldArray: FieldArrayType<any> = fieldConfig

          const initial =
            typeof initialValues[fieldName] !== 'undefined'
              ? initialValues[fieldName]
              : model[fieldName].initial || []

          initialValues[fieldName] = initial

          setIn(form.values, initial, depth)

          fields[fieldName] = new FieldArray(
            {
              model: model[fieldName].model || DefaultModel,
              value: initial
            },
            form,
            depth
          )
          break
        }
      }
    }
  }

  return fields
}
