import { Omit, IFieldConfig } from '../interfaces'
import { ModelConstructorType } from '../Form'

export const $fields = Symbol('fields')

export function field<T, M>(config: Omit<IFieldConfig<T, M>, 'value'> = {}) {
  return (target: any, key: any) => {
    if (!Object.getOwnPropertyDescriptor(target, $fields)) {
      Object.defineProperty(target, $fields, {
        configurable: true,
        enumerable: true,
        writable: true
      })
      target[$fields] = {
        [key]: { ...config, type: 'field', name: key }
      }
    } else {
      target[$fields][key] = { ...config, type: 'field', name: key }
    }
  }
}

export function fieldArray(config: Omit<IFieldArrayConfig, 'value'> = {}) {
  return (target: any, key: any) => {
    if (!Object.getOwnPropertyDescriptor(target, $fields)) {
      Object.defineProperty(target, $fields, {
        configurable: true,
        enumerable: true,
        writable: true
      })
      target[$fields] = {
        [key]: { ...config, type: 'fieldArray', name: key }
      }
    } else {
      target[$fields][key] = { ...config, type: 'fieldArray', name: key }
    }
  }
}

export interface IFieldArrayConfig {
  model?: ModelConstructorType | string | number
  value: any[]
}
