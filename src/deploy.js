const fs = require('fs')
const core = require('@actions/core')
const { context } = require('@actions/github')
const yaml = require('js-yaml')

module.exports = deploy

async function deploy(harbormaster) {
  if (!context.payload.comment.body.startsWith(core.getInput('trigger'))) {
    core.info('Comment does not match the trigger, exiting.')
    return
  }

  const [, environmentName = core.getInput('default_environment')] = context.payload.comment.body.split(' ').filter(i => !!i)

  let environment
  try {
    environment = await harbormaster.getEnvironment({ name: environmentName })
  } catch (err) {
    return core.setFailed(err)
  }

  if (!environment) {
    return core.setFailed(`Environment ${environment.name} not found`)
  }

  try {
    const pkg = await harbormaster.postPackage({
      appManifest: yaml.load(await fs.promises.readFile(`${process.env.GITHUB_WORKSPACE}/.scoop/app.yaml`, 'utf8')),
      commitTime: context.payload.comment.created_at,
      version: `${core.getInput('ref')}-test`,
      metadata: {
        ciBuildUrl: `${core.getInput('ci_url_prefix')}${context.payload.repository.full_name}`,
        commitUrl: context.payload.issue.pull_request.html_url
      },
      branch: core.getInput('branch')
    })

    await harbormaster.postRelease({
      package: { id: pkg.id },
      environment: { name: environmentName },
      type: 'promote'
    })

    core.info('Successfully released')
  } catch (err) {
    return core.setFailed(err)
  }
}
