import { remote } from "electron"

const remoteSettings = remote.require("./electron/common/settings.js").settings

console.log(remoteSettings)

function get(name: string) {
    return remoteSettings.get(name)
}

function set(name: string, value: any) {
    remoteSettings.set(name, value)
}

function save() {
    return remoteSettings.save()
}

export default {
    get,
    set,
    save
}
