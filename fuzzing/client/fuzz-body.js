'use strict'

const { request } = require('../../undici')

async function fuzz (netServer, buf) {
  try {
    if (!netServer.address()) {
      return
    }
    const data = await request(`http://localhost:${netServer.address().port}`, { body: buf })
    data.body.destroy().on('error', () => {})
  } catch (err) {
    if (err.code === 'ERR_INVALID_ARG_TYPE') {
      // Okay error
    } else if (err.code === 'UND_ERR_CONNECT_TIMEOUT') {
      // Okay error
    } else if (err.code === 'HPE_INVALID_CONSTANT') {
      // Okay error
    } else if (err.code === 'UND_ERR_SOCKET') {
      // Okay error
    } else {
      throw err
    }
  }
}

module.exports = fuzz
