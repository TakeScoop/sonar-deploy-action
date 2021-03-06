const core = require('@actions/core')
const { context } = require('@actions/github')

const Harbormaster = require('./lib/harbormaster')
const deploy = require('./deploy')

async function main () {
  let clientEmail
  let privateKey
  try {
    ({
      client_email: clientEmail,
      private_key: privateKey
    } = JSON.parse(Buffer.from(process.env.SONAR_CREDENTIALS, 'base64').toString('utf-8')))
  } catch (err) {
    return core.setFailed(err)
  }

  core.setSecret(privateKey)

  const harbormaster = new Harbormaster({
    url: core.getInput('sonar_url'),
    token: await Harbormaster.getServiceAccountToken({ clientEmail, privateKey })
  })

  const config = {
    defaultEnvironment: core.getInput('default_environment'),
    appManifest: core.getInput('app_manifest'),
    version: core.getInput('version'),
    ciUrlPrefix: core.getInput('ci_url_prefix'),
    gitRef: core.getInput('ref'),
    branch: core.getInput('branch'),
    trigger: core.getInput('trigger'),
    workspace: process.env.GITHUB_WORKSPACE
  }

  await deploy(harbormaster, config, context)
}

main()
