'use strict'

const net = require('net')

const serverFuzzFnMap = require('./server')
const clientFuzzFnMap = require('./client')

const netServer = net.createServer((socket) => {
  socket.on('data', (data) => {
    // Select server fuzz fn based on the buf input
    const serverFuzzFns = Object.entries(serverFuzzFnMap)
    // TODO: make this deterministic based on the input data somehow
    const [, serverFuzzFn] = serverFuzzFns[Math.floor(Math.random() * serverFuzzFns.length)]

    serverFuzzFn(socket, data)
  })
})
const waitForNetServer = netServer.listen(0)

// Set script to exit gracefully after a set period of time.
// Currently: 5 minutes
const timer = setTimeout(() => {
  process.kill(process.pid, 'SIGINT')
}, 300_000) // 5 minutes

async function fuzz (buf) {
  // Wait for net server to be ready
  await waitForNetServer

  // Select client fuzz fn based on the buf input
  const clientFuzzFns = Object.entries(clientFuzzFnMap)
  const index = parseInt(buf.toString('hex') || '0', 16) % clientFuzzFns.length
  const [clientFuzzFnName, clientFuzzFn] = clientFuzzFns[index]

  try {
    await clientFuzzFn(netServer, buf)
  } catch (error) {
    console.log(`=== Failed fuzz ${clientFuzzFnName} with input ${buf} ===`)
    clearTimeout(timer)
    throw error
  }
}

module.exports = {
  fuzz
}
