import { contextBridge, ipcRenderer } from 'electron'

import sdk from './preload/sdk'

console.log('preload.js')
const ipc = {
  send: (channel: string, data: any) => {
    ipcRenderer.send(channel, data)
  },

  on: (channel: string, listener: (ctx: any, ...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => {
      const ctx = event
      listener(ctx, ...args)
    })
  },
}

const api = { sdk, ipc }

contextBridge.exposeInMainWorld('__api__', api)
