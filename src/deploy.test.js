const _ = require('lodash')
const expect = require('chai').expect
const sinon = require('sinon')
const deploy = require('./deploy')

const getHarbormaster = (extensions = {}) => _.merge({
  getEnvironment ({ name }) {
    return Promise.resolve({
      name
    })
  },
  postPackage () {
    return Promise.resolve({
      id: 'a235ac1b-39cd-460f-ac58-97ce5bc22bdc'
    })
  },
  postRelease () {
    return Promise.resolve({
      id: '4d821a35-469b-480f-8f4d-60631d295b09'
    })
  }
}, extensions)

const getContext = (extensions = {}) => _.merge({
  payload: {
    comment: {
      body: '/deploy staging',
      created_at: '2021-03-11T21:37:02.186Z'
    },
    repository: {
      full_name: 'takescoop/sonar-deploy-action',
      html_url: 'https://github.com/takescoop/sonar-deploy-action'
    }
  }
}, extensions)

const getConfig = (extensions = {}) => _.merge({
  defaultEnvironment: 'staging',
  appManifest: 'test/fixtures/app.yaml',
  version: '124cb6d97d86ed4b93eccc95a8ce4ff58a24f843',
  ciUrlPrefix: 'https://app.circleci.com/pipelines/github/',
  gitRef: '124cb6d97d86ed4b93eccc95a8ce4ff58a24f843',
  branch: 'feature',
  trigger: '/deploy',
  workspace: '.'
}, extensions)

describe('deploy', () => {
  it('should call the harbormaster API appropriately for a single deployment request', async () => {
    const packageId = '12345'
    const harbormaster = getHarbormaster({
      postPackage () {
        return Promise.resolve({ id: packageId })
      }
    })
    sinon.spy(harbormaster)
    const config = getConfig()
    const context = getContext()

    await deploy(harbormaster, config, context)

    expect(harbormaster.getEnvironment.calledOnce).to.equal(true)
    expect(harbormaster.getEnvironment.getCalls()[0].args[0]).to.eql({ name: config.defaultEnvironment })

    expect(harbormaster.postPackage.calledOnce).to.equal(true)
    expect(harbormaster.postPackage.getCalls()[0].args[0]).to.include({
      branch: config.branch,
      version: config.version
    })
    expect(harbormaster.postPackage.getCalls()[0].args[0].appManifest.app.name).to.equal('app')
    expect(harbormaster.postPackage.getCalls()[0].args[0].metadata).to.include({
      ciBuildUrl: `${config.ciUrlPrefix}${context.payload.repository.full_name}`,
      commitUrl: `${context.payload.repository.html_url}/commit/${config.gitRef.substr(0, 7)}`
    })

    expect(harbormaster.postRelease.calledOnce).to.equal(true)

    expect(harbormaster.postRelease.getCalls()[0].args[0]).to.eql({
      package: { id: packageId },
      environment: { name: config.defaultEnvironment },
      type: 'promote'
    })
  })
})
