import { Omit, IFieldConfig, IFieldArrayConfig } from '../interfaces'

export const $fields = Symbol('fields')

export function field<T, M>(config: Omit<IFieldConfig<T, M>, 'value'> = {}) {
  return (target: any, key: any) => {
    if (!target[$fields]) {
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

export function fieldArray(config: Omit<IFieldArrayConfig, 'value' | 'model'> = {}) {
  return (target: any, key: any) => {
    if (!target[$fields]) {
      Object.defineProperty(target, $fields, {
        configurable: true,
        enumerable: true,
        writable: true
      })
      target[$fields] = {
        [key]: { ...config, type: 'fieldArray', name: key }
      }
    } else {
      target[$fields][key] = {
        ...config,
        type: 'fieldArray',
        name: key
      }
    }
  }
}
