import { app as ElectronApp } from 'electron'
import './utils/config'

import { Application } from './electron/app-entry'

import './electron/common/settings'

import mkdirp from 'mkdirp'

import * as AppCore from '../../nativelib/app_core'

mkdirp(global.CONFIG.appDataDir)
  .then()
  .catch((err) => {
    console.error(err)
  })

const appEntry = new Application()

ElectronApp.on('ready', () => {
  appEntry.init(__dirname)
  appEntry.start()

  console.error(`AppCore.hello(): ${AppCore.hello()}`)
})

ElectronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    ElectronApp.quit()
  }
})

ElectronApp.on('activate', () => {
  appEntry.activate()
})
