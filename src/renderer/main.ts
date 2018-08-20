import { ipcRenderer } from "electron"

import { WebEvents } from "../main/electron/events"

console.log("renderer...")

const sebWebReady = () => {
    ipcRenderer.send(WebEvents.APP.READY)
}

const quit = () => {
    ipcRenderer.send(WebEvents.APP.QUIT)
}

const quitButton = document.getElementById("quit") as HTMLButtonElement
quitButton.addEventListener("click", quit)

const { api } = window as any

setTimeout(() => {
    console.log(api.sdk.version)
    sebWebReady()
}, 2000)
