import { setIn } from './setIn'

describe('setIn', () => {
  it('should set value', () => {
    const state: {
      count?: number
      customers?: Array<{ firstName: string; lastName: string }>
    } = {
      customers: []
    }

    setIn(state, 1, ['count'])

    setIn(state, 'Alex', ['customers', '[0]', 'firstName'])
    setIn(state, 'Olefirenko', ['customers', '[0]', 'lastName'])

    setIn(state, 'Alex1', ['customers', '[1]', 'firstName'])
    setIn(state, 'Olefirenko1', ['customers', '[1]', 'lastName'])

    setIn(state, 'Alex', ['customers', '[0]', 'firstName'])
    setIn(state, 'Olefirenko', ['customers', '[0]', 'lastName'])

    setIn(state, 'Alex1', ['customers', '[1]', 'firstName'])
    setIn(state, 'Olefirenko1', ['customers', '[1]', 'lastName'])

    expect(state.count).toBe(1)
    expect(state.customers![0].firstName).toBe('Alex')
    expect(state.customers).toEqual([
      {
        firstName: 'Alex',
        lastName: 'Olefirenko'
      },
      {
        firstName: 'Alex1',
        lastName: 'Olefirenko1'
      }
    ])

    setIn(state, undefined, ['count'])
    expect(state.count).not.toBeDefined()
  })
})
