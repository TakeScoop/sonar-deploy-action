const core = require('@actions/core')

const Harbormaster = require('./lib/harbormaster')
const deploy = require('./deploy')

async function main () {
  const {
    client_email: clientEmail,
    private_key: privateKey,
  } = JSON.parse(Buffer.from(process.env.SONAR_CREDENTIALS, 'base64').toString('utf-8'))

  core.setSecret(privateKey)

  const harbormaster = new Harbormaster({
    url: core.getInput('sonar_url'),
    token: await Harbormaster.getServiceAccountToken({ clientEmail, privateKey }),
  })

  await deploy(harbormaster)
}

main()
