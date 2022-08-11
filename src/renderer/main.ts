import { WebEvents } from '../main/electron/events'

console.log('renderer...')

const sebWebReady = () => {
  ;(window as any).__api__.ipc.send(WebEvents.APP.READY)
}

const quit = () => {
  ;(window as any).__api__.ipc.send(WebEvents.APP.QUIT)
}

const quitButton = document.getElementById('quit') as HTMLButtonElement
quitButton.addEventListener('click', quit)

const { __api__ } = window as any

setTimeout(() => {
  console.log(__api__.sdk.version)
  sebWebReady()
}, 2000)
