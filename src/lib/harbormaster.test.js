const nock = require('nock')
const chai = require('chai').use(require('chai-as-promised'))
const Harbormaster = require('./harbormaster')

const expect = chai.expect
const TEST_URL = 'https://test.com'

function newHarbormaster (props = {}) {
  return new Harbormaster({
    url: TEST_URL,
    token: 'token',
    ...props
  })
}

describe('harbormaster', () => {

  beforeEach(() => nock.cleanAll())

  it('should include the error data when a request fails', async () => {
    const pkg = {
      branch: 'main',
      version: 'version',
      appManifest: { invalid: true, app: { name: 'app' } },
      metadata: {
        ciBuildUrl: 'https://app.circleci.com/pipelines/github/takescoop/app/',
        commitUrl: 'https://github.com/takescoop/app/commit/5c122b7'
      }
    }

    nock(TEST_URL)
      .post(`/packages?appName=${pkg.appManifest.app.name}`)
      .reply(409, { message: 'oh no!' })

    const harbormaster = newHarbormaster()
    const err = await harbormaster.postPackage(pkg).catch(err => err)
    expect(err.message).to.include('oh no!')
  })

  describe('getEnvironment', () => {
    beforeEach(() => nock.cleanAll())
    it('should return an environment', async () => {
      const staging = { id: '123', name: 'staging' }

      nock(TEST_URL)
        .get('/environments')
        .reply(200, [
          staging,
          { id: '456', name: 'production' }
        ])

      const harbormaster = newHarbormaster()
      expect(await harbormaster.getEnvironment({ name: 'staging' })).to.eql(staging)
      expect(nock.isDone()).to.equal(true)
    })
  })

  describe('postPackage', () => {
    beforeEach(() => nock.cleanAll())
    it('should post a package', async () => {
      const pkg = {
        branch: 'main',
        version: 'version',
        appManifest: { kind: 'takescoop.com/sonar/v1', app: { name: 'app' } },
        metadata: {
          ciBuildUrl: 'https://app.circleci.com/pipelines/github/takescoop/app/',
          commitUrl: 'https://github.com/takescoop/app/commit/5c122b7'
        }
      }
      nock(TEST_URL)
        .post(`/packages?appName=${pkg.appManifest.app.name}`)
        .reply(200, { id: '123', ...pkg })

      const harbormaster = newHarbormaster()
      expect(await harbormaster.postPackage(pkg)).to.eql({ id: '123', ...pkg })
      expect(nock.isDone()).to.equal(true)
    })
  })

  describe('postRelease', () => {
    beforeEach(() => nock.cleanAll())
    it('should post a release', async () => {
      const release = {
        package: { id: '123' },
        environment: { name: 'staging' },
        type: 'promote'
      }
      nock(TEST_URL)
        .post('/releases')
        .reply(200, { id: '123', ...release })

      const harbormaster = newHarbormaster()

      expect(await harbormaster.postRelease(release)).to.eql({ id: '123', ...release })
      expect(nock.isDone()).to.equal(true)
    })
  })
})
