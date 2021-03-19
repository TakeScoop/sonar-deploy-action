const nock = require('nock')
const expect = require('chai').expect
const Harbormaster = require('./harbormaster')

function newHarbormaster (props = {}) {
  return new Harbormaster({
    url: 'https://test.com',
    token: 'token',
    ...props
  })
}

describe('harbormaster', () => {
  beforeEach(() => nock.cleanAll())
  it('should include the error data when a request fails', async () => {
    const harbormaster = newHarbormaster()
    const pkg = {
      branch: 'main',
      version: 'version',
      appManifest: { invalid: true, app: { name: 'app' } },
      metadata: {
        ciBuildUrl: 'https://app.circleci.com/pipelines/github/takescoop/app/',
        commitUrl: 'https://github.com/takescoop/app/commit/5c122b7'
      }
    }

    nock(harbormaster.url)
      .post(`/packages?appName=${pkg.appManifest.app.name}`)
      .reply(409, { message: 'oh no!' })

    const err = await harbormaster.postPackage(pkg).catch(err => err)
    expect(err.message).to.include('oh no!')
  })

  describe('getEnvironment', () => {
    beforeEach(() => nock.cleanAll())
    it('should return an environment', async () => {
      const harbormaster = newHarbormaster()
      const staging = { id: '123', name: 'staging' }

      nock(harbormaster.url)
        .get('/environments')
        .reply(200, [
          staging,
          { id: '456', name: 'production' }
        ])

      expect(await harbormaster.getEnvironment({ name: 'staging' })).to.eql(staging)
      expect(nock.isDone()).to.equal(true)
    })
  })

  describe('postPackage', () => {
    beforeEach(() => nock.cleanAll())
    it('should post a package', async () => {
      const harbormaster = newHarbormaster()
      const pkg = {
        branch: 'main',
        version: 'version',
        appManifest: { kind: 'takescoop.com/sonar/v1', app: { name: 'app' } },
        metadata: {
          ciBuildUrl: 'https://app.circleci.com/pipelines/github/takescoop/app/',
          commitUrl: 'https://github.com/takescoop/app/commit/5c122b7'
        }
      }

      nock(harbormaster.url)
        .post(`/packages?appName=${pkg.appManifest.app.name}`)
        .reply(200, { id: '123', ...pkg })

      expect(await harbormaster.postPackage(pkg)).to.eql({ id: '123', ...pkg })
      expect(nock.isDone()).to.equal(true)
    })
  })

  describe('postRelease', () => {
    beforeEach(() => nock.cleanAll())
    it('should post a release', async () => {
      const harbormaster = newHarbormaster()
      const release = {
        package: { id: '123' },
        environment: { name: 'staging' },
        type: 'promote'
      }

      nock(harbormaster.url)
        .post('/releases')
        .reply(200, { id: '123', ...release })

      expect(await harbormaster.postRelease(release)).to.eql({ id: '123', ...release })
      expect(nock.isDone()).to.equal(true)
    })
  })
})
