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
  test('correct form values', () => {
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

    const form = new Form(UserFormModel, {
      initialValues: {
        login: 'Alex',
        password: 'Password'
      }
    })

    form.fields.emails.map(item => {
      item.onChange({ target: { value: 'test' } })
    })

    expect(form.values).toEqual({
      login: 'Alex',
      password: 'Password',
      hobbies: [{ hobbyId: 1, hobbyName: 'dev' }],
      emails: ['test']
    })
  })
})
