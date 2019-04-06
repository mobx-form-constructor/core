import { field, Form } from '../'
import { fieldArray } from '../decorators'

import Hobby from './Hobby'

describe('simple example', () => {
  test('correct form values', () => {
    class UserFormModel {
      @field()
      login = 'alex'

      @field()
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

    expect(form.values).toEqual({
      login: 'Alex',
      password: 'Password',
      hobbies: [{ hobbyId: 1, hobbyName: 'dev' }],
      emails: ['olefirenk@gmail.com']
    })
  })
})
