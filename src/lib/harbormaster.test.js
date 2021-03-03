const expect = require('chai').expect
const nock = require('nock')

const Harbormaster = require('./harbormaster')

const testUrl = 'https://test.takescoop.com'

describe('harbormaster', () => {
  beforeEach(() => nock.cleanAll())

  it('should request environmnets', async () => {
    const environment = { name: 'staging' }
    nock(testUrl)
      .get('/environments')
      .reply(200, [environment])

    const harbormaster = new Harbormaster({ url: testUrl, token: '12345' })
    const res = await harbormaster.getEnvironment({ name: 'staging' })
    expect(nock.isDone()).to.equal(true)
    expect(res).to.eql(environment)
  })

  it('should post a package', async () => {
    const appName = 'app'
    const pkg = { id: '6789' }
    nock(testUrl)
      .post(`/packages?appName=${appName}`)
      .reply(200, pkg)

    const harbormaster = new Harbormaster({ url: testUrl, token: '12345' })
    const res = await harbormaster.postPackage({
      appManifest: {
        app: {
          name: appName
        },
        commitTime: '2021-03-02T09:33:15.881Z',
        version: 'sha-test',
        metadata: {
          ciBuildUrl: `https://circle.com/${appName}`,
          commitUrl: `https://github.com/owner/${appName}`
        },
        branch: 'test'
      }
    })
    expect(nock.isDone()).to.equal(true)
    expect(res).to.eql(pkg)
  })

  it('should post a release', async () => {
    const release = { id: '12345' }
    nock(testUrl)
      .post('/releases')
      .reply(200, release)

    const harbormaster = new Harbormaster({ url: testUrl, token: '12345' })
    const res = await harbormaster.postRelease({
      package: { id: '6789' },
      environment: { name: 'staging' },
      type: 'promote'
    })
    expect(nock.isDone()).to.equal(true)
    expect(res).to.eql(release)
  })
})
