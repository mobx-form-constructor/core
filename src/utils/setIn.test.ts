import { setIn } from './setIn'

describe('setIn', () => {
  it('should set value', () => {
    const state: {
      count?: number
      customers?: Array<{ firstName: string }>
    } = {
      customers: []
    }

    setIn(state, 1, ['count'])
    setIn(state, 'Alex', ['customers', '[0]', 'firstName'])

    expect(state.count).toBe(1)
    expect(state.customers![0].firstName).toBe('Alex')

    setIn(state, undefined, ['count'])
    expect(state.count).not.toBeDefined()
  })
})
