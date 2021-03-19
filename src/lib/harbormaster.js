const _ = require('lodash')
const axios = require('axios')
const { JWT } = require('google-auth-library')

async function request (...args) {
  try {
    return await axios(...args)
  } catch (err) {
    // https://github.com/axios/axios#handling-errors
    if (_.get(err, 'response.data')) {
      err.message += '\n' + JSON.stringify(err.response.data)
    } else if (_.get(err, 'request.data')) {
      err.message += '\n' + JSON.stringify(err.request.data)
    }

    throw err
  }
}

class Client {
  constructor ({ url, token }) {
    this.url = url
    this.token = token
  }

  static async getServiceAccountToken ({ clientEmail, privateKey }) {
    const client = new JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/cloud-platform']
    )
    return (await client.getAccessToken()).token
  }

  async getEnvironment (query) {
    const environments = await request({
      url: `${this.url}/environments`,
      headers: { Authorization: `Bearer ${this.token}` }
    })

    return environments.data.find((env) => env.name === query.name)
  }

  async postPackage (props) {
    return (await request({
      url: `${this.url}/packages?appName=${props.appManifest.app.name}`,
      headers: { Authorization: `Bearer ${this.token}` },
      method: 'post',
      data: props
    })).data
  }

  async postRelease (props) {
    return (await request({
      url: `${this.url}/releases`,
      headers: { Authorization: `Bearer ${this.token}` },
      method: 'post',
      data: props
    })).data
  }
}

module.exports = Client
