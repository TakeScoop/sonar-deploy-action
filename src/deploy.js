const fs = require('fs')
const core = require('@actions/core')
const path = require('path')

const yaml = require('js-yaml')

module.exports = deploy

async function deploy (harbormaster, config, context) {
  if (!context.payload.comment.body.startsWith(config.trigger)) {
    core.info('Comment does not match the trigger, exiting.')
    return
  }

  const [, environmentName = config.defaultEnvironment] = context.payload.comment.body.split(' ').filter(i => !!i)

  let environment
  try {
    environment = await harbormaster.getEnvironment({ name: environmentName })
  } catch (err) {
    return core.setFailed(`${err.message}\n${err.stack}`)
  }

  if (!environment) {
    return core.setFailed(`Environment ${environment.name} not found`)
  }

  try {
    const appManifest = yaml.load(
      await fs.promises.readFile(path.resolve(config.workspace, config.appManifest), 'utf8')
    )

    const pkg = await harbormaster.postPackage({
      appManifest,
      commitTime: context.payload.comment.created_at,
      version: config.version,
      metadata: {
        ciBuildUrl: `${config.ciUrlPrefix}${context.payload.repository.full_name}`,
        commitUrl: `${context.payload.repository.html_url}/commit/${config.gitRef.substr(0, 7)}`
      },
      branch: config.branch
    })

    await harbormaster.postRelease({
      package: { id: pkg.id },
      environment: { name: environment.name },
      type: 'promote'
    })

    core.info('Successfully released')
  } catch (err) {
    return core.setFailed(`${err.message}\n${err.stack}`)
  }
}
