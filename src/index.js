const core = require('@actions/core')

const Harbormaster = require('./lib/harbormaster')
const publish = require('./publish')

async function main () {
  const harbormaster = new Harbormaster({
    url: core.getInput('sonar_url'),
    token: await Harbormaster.getServiceAccountToken(
      JSON.parse(Buffer.from(process.env.SONAR_CREDENTIALS, 'base64').toString('utf-8'))
    )
  })

  publish(harbormaster)
}

main()
