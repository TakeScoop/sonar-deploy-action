const expect = require('chai').expect
const index = require('.')

describe('index', () => {
  it('should pass', () => {
    expect(index.foo).to.equal('bar')
  })
})
