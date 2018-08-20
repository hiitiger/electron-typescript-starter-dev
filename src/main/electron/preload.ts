import sdk from "./preload/sdk"
import settings from "./preload/settings"

const api = { sdk, settings }

process.once("loaded", function() {
    const window: any = global
    window.api = api
})
