import { field, Form } from '../'
import { fieldArray } from '../decorators'

import Hobby from './Hobby'

function required({ value }: any) {
  return !value ? 'Required' : ''
}

function minLength(length: number) {
  return ({ value }: any) =>
    value.length < length ? `Min length ${length}` : ''
}

describe('simple example', () => {
  class UserFormModel {
    @field({ validate: [required, minLength(3)] })
    login = 'alex'

    @field({ validate: [required, minLength(10)] })
    password = 'password'

    @fieldArray({ model: Hobby })
    hobbies: Hobby[] = [{ hobbyId: 1, hobbyName: 'dev' }]

    @fieldArray()
    emails: string[] = ['olefirenk@gmail.com']
  }

  test('initialize from model', () => {
    const form = new Form(UserFormModel)

    expect(form.values).toEqual({
      login: 'alex',
      password: 'password',
      hobbies: [{ hobbyId: 1, hobbyName: 'dev' }],
      emails: ['olefirenk@gmail.com']
    })
  })

  test('initialValues should override model default values', () => {
    const form = new Form(UserFormModel, {
      initialValues: {
        login: 'Alex',
        password: 'Password',
        hobbies: [{ hobbyId: 1, hobbyName: 'Dev' }],
        emails: ['Olefirenk@gmail.com']
      }
    })

    expect(form.values).toEqual({
      login: 'Alex',
      password: 'Password',
      hobbies: [{ hobbyId: 1, hobbyName: 'Dev' }],
      emails: ['Olefirenk@gmail.com']
    })
  })

  test('Field: onChange', () => {
    const form = new Form(UserFormModel)

    form.fields.login.onChange({ target: { value: 'test' } })

    expect(form.values.login).toBe('test')
    expect(form.fields.login.value).toBe('test')
  })

  test('FieldArray: onChange', () => {
    const form = new Form(UserFormModel)

    form.fields.emails.push('olefirenk+1@gmail.com')

    expect(
      form.fields.emails.value.find(
        item => item.value === 'olefirenk+1@gmail.com'
      )
    ).not.toBe(-1)
  })
})
