const { request } = require('../undici')
const { InvalidArgumentError } = require('../undici/lib/core/errors')

async function fuzz (buf) {
  try {
    const string = buf.toString()
    await request('http://localhost:9999', { body: string })
  } catch (err) {
    if (err instanceof Error && err.code === 'ECONNREFUSED') {
      // Okay error
    } else if (err instanceof TypeError && err.code === 'ERR_INVALID_URL') {
      // Okay error
    } else if (err instanceof InvalidArgumentError && err.code === 'UND_ERR_INVALID_ARG') {
      // Okay error
    } else {
      throw err
    }
  }
}

module.exports = {
  fuzz
}
