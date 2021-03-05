const core = require('@actions/core')

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

  await deploy(harbormaster)
}

main()
