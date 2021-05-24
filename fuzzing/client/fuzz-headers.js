'use strict'

const { request } = require('../../undici')

async function fuzz (netServer, buf) {
  try {
    if (!netServer.address()) {
      return
    }
    const data = await request(`http://localhost:${netServer.address().port}`, {
      headers: { buf: buf.toString() }
    })
    data.body.destroy().on('error', () => {})
  } catch (err) {
    if (err.code === 'ERR_INVALID_ARG_TYPE') {
      // Okay error
    } else if (err.code === 'HPE_INVALID_HEADER_TOKEN') {
      // Okay error
    } else if (err.code === 'HPE_LF_EXPECTED') {
      // Okay error
    } else if (err.code === 'UND_ERR_CONNECT_TIMEOUT') {
      // Okay error
    } else {
      throw err
    }
  }
}

module.exports = fuzz
