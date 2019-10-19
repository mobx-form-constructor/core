import { autorun } from 'mobx'

import { Field } from '../Field'
import { Form } from '../Form'
// import { $fields } from '../decorators'

import UserFormModel from './UserForm.model'

describe('simple example', () => {
  test('initialize from model', () => {
    const form = new Form(UserFormModel, {
      name: 'UserForm'
    })

    expect(form.values).toMatchSnapshot()
    expect(form.name).toBe('UserForm')
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

    expect(form.values).toMatchSnapshot()
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

    expect(form.fields.emails.value.find(item => item.value === 'olefirenk+1@gmail.com')).not.toBe(-1)
  })

  test('FieldArray: validate', async () => {
    const form = new Form(UserFormModel, {
      initialValues: {
        hobbies: []
      }
    })

    form.fields.hobbies.push({ hobbyId: 0, hobbyName: '' })

    await form.validate()

    expect(form.errors).toEqual({
      emails: [],
      hobbies: [{ hobbyId: 'Required', hobbyName: 'Required' }]
    })

    form.fields.hobbies.push({ hobbyId: 1, hobbyName: 'dev' })

    await form.validate()

    expect(form.errors).toEqual({
      emails: [],
      hobbies: [{ hobbyId: 'Required', hobbyName: 'Required' }, {}]
    })
  })

  test('Field normalize', () => {
    const form = new Form(UserFormModel)

    form.fields.password.onChange({ target: { value: ' testvalue ' } })

    expect(form.fields.password.value).toBe('testvalue')
    expect(form.values.password).toBe('testvalue')
  })

  test('Form reset', () => {
    const form = new Form(UserFormModel)

    form.fields.password.onChange('Password')

    expect(form.fields.password.value).toBe('Password')
    expect(form.values.password).toBe('Password')

    form.reset()

    expect(form.fields.password.value).toBe('password')
    expect(form.values.password).toBe('password')

    expect(form.pristine).toBe(true)
  })

  test('Form submit', async () => {
    // without submit handlers

    const form = new Form(UserFormModel)

    await form.handleSubmit()

    expect(form.valid).toBe(true)
    expect(form.invalid).toBe(false)

    expect(form.submitted).toBe(false)
    expect(form.submitFailed).toBe(false)
    expect(form.submitting).toBe(false)
  })

  test('Form submit :: success', async () => {
    const onSubmit = jest.fn<Promise<any>, [Form<UserFormModel>]>()
    const onSubmitSuccess = jest.fn<void, [any]>()

    const form = new Form(UserFormModel, {
      onSubmit,
      onSubmitSuccess
    })

    const preventDefault = jest.fn()

    await form.handleSubmit({ preventDefault })

    expect(preventDefault).toBeCalled()
    expect(form.valid).toBe(true)
    expect(form.invalid).toBe(false)
    expect(form.submitted).toBe(true)
    expect(form.submitFailed).toBe(false)
    expect(form.submitting).toBe(false)

    expect(onSubmit).toBeCalledWith(form)
    expect(onSubmitSuccess).toBeCalled()
  })

  test('Form submit :: success without handlers', async () => {
    const onSubmit = jest.fn<Promise<any>, [Form<UserFormModel>]>()

    const form = new Form(UserFormModel, {
      onSubmit
    })

    await form.handleSubmit()

    expect(onSubmit).toBeCalledWith(form)
  })

  test('Form submit :: validation errors', async () => {
    const onSubmit = jest.fn<Promise<any>, [Form<UserFormModel>]>()
    const onSubmitFail = jest.fn<void, [any]>()

    const form = new Form(UserFormModel, {
      onSubmit,
      onSubmitFail
    })

    expect(form.pristine).toBe(true)
    expect(form.dirty).toBe(false)
    expect(form.valid).toBe(true)

    form.fields.login.onChange('')
    form.fields.password.onChange('')

    await form.validate()
    await form.handleSubmit()

    expect(form.pristine).toBe(false)
    expect(form.dirty).toBe(true)
    expect(form.valid).toBe(false)
    expect(form.invalid).toBe(true)
    expect(form.submitted).toBe(false)
    expect(form.submitFailed).toBe(true)
    expect(form.submitting).toBe(false)

    expect(onSubmit).not.toBeCalledWith(form)
    expect(onSubmitFail).toBeCalledWith({ login: 'Required', password: 'Required', emails: [], hobbies: [{}] }, form)

    expect(form.errors.login).toBe('Required')
    expect(form.errors.password).toBe('Required')

    form.setError('error message')

    expect(form.error).toBe('error message')
  })

  test('Form submit :: validation errors without handlers', async () => {
    const onSubmit = jest.fn<Promise<any>, [Form<UserFormModel>]>()

    const form = new Form(UserFormModel, {
      onSubmit
    })

    form.fields.login.onChange('')
    form.fields.password.onChange('')

    await form.handleSubmit()
  })

  test('Form submit :: submit errors', async () => {
    const onSubmit = () => Promise.reject({ message: 'Wrong credentials' })
    const onSubmitFail = jest.fn()

    const form = new Form(UserFormModel, {
      onSubmit,
      onSubmitFail
    })

    await form.handleSubmit()

    expect(form.submitted).toBe(false)
    expect(form.submitFailed).toBe(true)
    expect(form.submitting).toBe(false)

    expect(onSubmitFail).toBeCalledWith({ message: 'Wrong credentials' }, form)
  })

  test('Form submit :: submit errors without handlers', async () => {
    const onSubmit = () => Promise.reject({ message: 'Wrong credentials' })

    const form = new Form(UserFormModel, {
      onSubmit
    })

    await form.handleSubmit()
  })

  test('Field input', () => {
    const form = new Form(UserFormModel)

    const didChangeForm = jest.fn<void, [string, any, Form<UserFormModel>]>()

    form.didChange = didChangeForm

    const didChange = jest.fn<void, [any, Field<string>]>()

    form.fields.login.didChange = didChange

    let loginField = form.fields.login.bind()

    autorun(() => {
      loginField = { ...form.fields.login.bind() }
    })

    expect(form.fields.login.active).toBe(false)
    expect(form.fields.login.valid).toBe(true)
    expect(form.fields.login.invalid).toBe(false)
    expect(form.fields.login.error).toBe('')
    expect(form.fields.login.touched).toBe(false)
    expect(form.fields.login.visited).toBe(false)
    expect(form.fields.login.dirty).toBe(false)
    expect(form.fields.login.pristine).toBe(true)

    loginField.onFocus()
    expect(form.fields.login.active).toBe(true)
    expect(form.fields.login.visited).toBe(true)

    loginField.onChange('new value')
    expect(form.fields.login.pristine).toBe(false)
    expect(form.fields.login.dirty).toBe(true)
    expect(didChange).toBeCalledWith('new value', form.fields.login)
    expect(didChangeForm).toBeCalledWith('login', 'new value', form)
    expect(loginField.value).toBe('new value')

    loginField.onBlur()
    expect(form.fields.login.touched).toBe(true)
    expect(form.fields.login.active).toBe(false)
    expect(form.fields.login.key).toBe('login')
    expect(form.fields.hobbies.value[0].hobbyId.key).toBe('hobbies[0].hobbyId')
  })

  test('Field checkbox', () => {
    const form = new Form(UserFormModel)

    let checkbox: ReturnType<typeof form.fields.employed.bindCheckbox> = form.fields.employed.bindCheckbox()

    autorun(() => {
      checkbox = { ...form.fields.employed.bindCheckbox() }
    })

    checkbox.onChange({ target: { type: 'checkbox', checked: false } })
    expect(checkbox.checked).toBe(false)

    expect(form.fields.employed.active).toBe(false)
    expect(form.fields.employed.touched).toBe(true)
  })

  test('Field radio', () => {
    const form = new Form(UserFormModel)

    let mustardRadio: ReturnType<typeof form.fields.sause.bindRadio> = form.fields.sause.bindRadio('mustard')

    let ketchupRadio: ReturnType<typeof form.fields.sause.bindRadio> = form.fields.sause.bindRadio('ketchup')

    autorun(() => {
      mustardRadio = { ...form.fields.sause.bindRadio('mustard') }
    })

    autorun(() => {
      ketchupRadio = { ...form.fields.sause.bindRadio('ketchup') }
    })

    mustardRadio.onChange({ target: { type: 'text', value: 'mustard' } })
    expect(mustardRadio.checked).toBe(true)
    expect(ketchupRadio.checked).toBe(false)
    expect(form.fields.sause.value).toBe('mustard')

    expect(form.fields.sause.active).toBe(false)
    expect(form.fields.sause.touched).toBe(true)
  })

  test('Field select-multiple', () => {
    const form = new Form(UserFormModel, {
      initialValues: {
        flavor: []
      }
    })

    expect(form.fields.flavor.value).toEqual([])

    form.fields.flavor.onChange({
      target: {
        options: [{ selected: true, value: 'grapefruit' }, { selected: false, value: 'lime' }],
        type: 'select-multiple'
      }
    })

    expect(form.fields.flavor.value).toEqual(['grapefruit'])

    form.fields.flavor.onChange({
      target: {
        type: 'select-multiple'
      }
    })

    expect(form.fields.flavor.value).toEqual([])
  })

  test('FieldArray validate array length', async () => {
    const form = new Form(UserFormModel, {
      initialValues: {
        emails: []
      }
    })

    await form.validate()

    expect(form.valid).toBe(false)
    expect(form.fields.emails.error).toBe('Required')
  })

  test('Form: keepEmpty', () => {
    const form = new Form(UserFormModel, { valuesBehavior: 'removeEmpty' })

    form.fields.password.onChange('password')
    expect(form.values.password).toBe('password')

    form.fields.password.onChange('')
    expect(form.values.password).not.toBeDefined()
  })

  test('FieldArray map', () => {
    const form = new Form(UserFormModel, {
      initialValues: {
        emails: ['olefirenk@gmail.com'],
        hobbies: [
          {
            hobbyId: 1,
            hobbyName: 'Dev'
          },
          {
            hobbyId: 2,
            hobbyName: 'Smth'
          }
        ]
      }
    })

    expect(form.fields.emails.map(item => item)[0].key).toBe('emails[0]')
    expect(form.fields.hobbies.map(item => item.hobbyId)[0].key).toBe('hobbies[0].hobbyId')
  })

  test('FieldArray values should be consitent', () => {
    const form = new Form(UserFormModel, {
      initialValues: {
        emails: ['olefirenk@gmail.com'],
        hobbies: [
          {
            hobbyId: 1,
            hobbyName: 'Dev'
          },
          {
            hobbyId: 2,
            hobbyName: 'Smth'
          }
        ]
      }
    })

    expect(form.values.hobbies).toEqual(form.initialValues.hobbies)
  })
})
