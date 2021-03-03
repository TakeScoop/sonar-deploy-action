const axios = require('axios')
const { JWT } = require('google-auth-library')

class Client {
  constructor ({ url, token }) {
    this.url = url
    this.token = token
  }

  static async getServiceAccountToken (credentials) {
    const client = new JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/cloud-platform']
    )

    return (await client.getAccessToken()).token
  }

  async getEnvironment (query) {
    const environments = await axios({
      url: `${this.url}/environments`,
      headers: { Authorization: `Bearer ${this.token}` }
    })

    return environments.data.find((env) => env.name === query.name)
  }

  async postPackage (props) {
    return (await axios({
      url: `${this.url}/packages?appName=${props.appManifest.app.name}`,
      headers: { Authorization: `Bearer ${this.token}` },
      method: 'post',
      data: props
    })).data
  }

  async postRelease (props) {
    return (await axios({
      url: `${this.url}/releases`,
      headers: { Authorization: `Bearer ${this.token}` },
      method: 'post',
      data: props
    })).data
  }
}

module.exports = Client
