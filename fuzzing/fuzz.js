'use strict'

const net = require('net')

const serverFuzzFnMap = require('./server')
const clientFuzzFnMap = require('./client')

const netServer = net.createServer((socket) => {
  socket.on('data', (data) => {
    const serverFuzzFns = Object.entries(serverFuzzFnMap)
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

  const clientFuzzFns = Object.entries(clientFuzzFnMap)
  const [clientFuzzFnName, clientFuzzFn] = clientFuzzFns[Math.floor(Math.random() * clientFuzzFns.length)]
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
