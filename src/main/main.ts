import { app as ElectronApp } from 'electron'
import './utils/config'

import { Application } from './electron/app-entry'

import { settings } from './electron/common/settings'

import mkdirp from 'mkdirp'

mkdirp(global.CONFIG.appDataDir)
  .then()
  .catch((err) => {
    console.error(err)
  })

const appEntry = new Application()

ElectronApp.on('ready', () => {
  appEntry.init(__dirname)
  appEntry.start()
})

ElectronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    ElectronApp.quit()
  }
})

ElectronApp.on('activate', () => {
  appEntry.activate()
})
