import { getIn } from './getIn'

describe('getIn', () => {
  it('should get value', () => {
    const state: {
      count?: number
      customers?: Array<{ firstName: string }>
    } = {
      count: 0,
      customers: [
        {
          firstName: 'alex'
        }
      ]
    }

    expect(getIn(state, ['count'])).toBe(0)
    expect(getIn(state, ['customers', '[0]', 'firstName'])).toBe('alex')
  })
})
