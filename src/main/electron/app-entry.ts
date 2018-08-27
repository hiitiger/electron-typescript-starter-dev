import { app as ElectronApp, BrowserWindow } from "electron"
import { Menu, Tray } from "electron"
import { ipcMain } from "electron"
import { shell } from "electron"
import * as path from "path"
import { WebEvents } from "./events"

enum AppWindows {
    main = "main",
    loading = "loading"
}

const ClientWindows: string[] = [AppWindows.main, AppWindows.loading]

const PREADLOAD_JS = path.join(__dirname, "./preload.js")

class Application {
    private windows: Map<string, Electron.BrowserWindow>
    private appDir: string
    private tray: Electron.Tray | null
    private markQuit = false
    private isWebReady = false

    constructor() {
        this.windows = new Map()
        this.appDir = ""
        this.tray = null
    }

    get mainWindow() {
        return this.windows.get(AppWindows.main) || null
    }

    set mainWindow(window: Electron.BrowserWindow | null) {
        if (!window) {
            this.windows.delete(AppWindows.main)
        } else {
            this.windows.set(AppWindows.main, window)
            window.on("closed", () => {
                this.mainWindow = null
            })

            window.loadURL(global.CONFIG.entryUrl)

            window.on("ready-to-show", () => {
                console.log("main window loaded")
            })

            window.webContents.on("did-fail-load", () => {
                window.reload()
            })

            window.webContents.on("new-window", (e, url) => {
                e.preventDefault()
                shell.openExternal(url)
            })

            window.webContents.on("will-navigate", (e, url) => {
                if (!url.startsWith(global.CONFIG.endPoint)) {
                    e.preventDefault()
                }
            })

            window.on("close", (event) => {
                if (this.markQuit) {
                    return
                }
                event.preventDefault()
                window.hide()
                return false
            })
        }
    }

    get browserWindows() {
        return this.windows
    }

    public init(appDir: string) {
        this.appDir = appDir
    }

    public getWindow(window: string) {
        return this.windows.get(window) || null
    }

    public createMainWindow() {
        const options: Electron.BrowserWindowConstructorOptions = {
            height: 600,
            width: 800,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                preload: PREADLOAD_JS
            }
        }
        const mainWindow = this.createWindow(AppWindows.main, options)
        this.mainWindow = mainWindow
        return mainWindow
    }

    public openMainWindow() {
        let mainWindow = this.mainWindow
        if (!mainWindow) {
            mainWindow = this.createMainWindow()
        }
        mainWindow!.show()
        mainWindow!.focus()
    }

    public closeMainWindow() {
        const mainWindow = this.mainWindow
        if (mainWindow) {
            mainWindow.close()
        }
    }

    public closeAllWindows() {
        const windows = this.windows.values()
        for (const window of windows) {
            window.close()
        }
    }

    public openLoadingWindow() {
        let loadingWindow = this.getWindow(AppWindows.loading)
        if (!loadingWindow) {
            const options = {
                width: 360,
                height: 600,
                show: false,
                frame: false,
                resizable: false
            }
            loadingWindow = this.createWindow(AppWindows.loading, options)
            loadingWindow.loadURL(global.CONFIG.loadingUrl)
            loadingWindow.on("ready-to-show", () => {
                if (!this.isWebReady) {
                    loadingWindow!.show()
                }
            })
            loadingWindow.on("close", () => {
                if (!this.isWebReady) {
                    this.quit()
                }
            })
        } else {
            loadingWindow.show()
        }
    }

    public closeWindow(name: string) {
        const window = this.windows.get(name)
        if (window) {
            window.close()
        }
    }

    public hideWindow(name: string) {
        const window = this.windows.get(name)
        if (window) {
            window.hide()
        }
    }

    public showAndFocusWindow(name: string) {
        const window = this.windows.get(name)
        if (window) {
            window.show()
            window.focus()
        }
    }

    public browserOpenWindow(
        name: string,
        url: string,
        preload: boolean,
        options: Electron.BrowserViewConstructorOptions
    ) {
        if (ClientWindows.indexOf(name) !== -1) {
            return null
        }

        if (preload) {
            options.webPreferences = {
                ...options.webPreferences,
                preload: PREADLOAD_JS
            }
        }

        const window = this.createWindow(name, options)

        window.loadURL(url)
        window.show()

        return window.id
    }

    public setupSystemTray() {
        if (!this.tray) {
            const icon = path.join(global.CONFIG.assetsDir, "app.ico")
            this.tray = new Tray(icon)
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: "OpenMainWindow",
                    click: () => {
                        this.showAndFocusWindow(AppWindows.main)
                    }
                },
                {
                    label: "About",
                    click: () => {
                        this.showAbout()
                    }
                },
                {
                    label: "Quit",
                    click: () => {
                        this.quit()
                    }
                }
            ])
            this.tray.setToolTip("WelCome")
            this.tray.setContextMenu(contextMenu)

            this.tray.on("click", () => {
                this.showAndFocusWindow(AppWindows.main)
            })
        }
    }

    public start() {
        this.setupIpc()
        this.createMainWindow()
        this.openLoadingWindow()
    }

    public activate() {
        this.openMainWindow()
    }

    public quit() {
        if (this.markQuit) {
            return
        }
        this.markQuit = true
        this.closeMainWindow()
        this.closeAllWindows()
        if (this.tray) {
            this.tray.destroy()
        }
    }

    public showAbout() {
        this.openLink(path.join(global.CONFIG.assetsDir, "about.txt"))
    }

    public openLink(url: string) {
        shell.openExternal(url)
    }

    private webReady() {
        this.isWebReady = true
        this.closeWindow(AppWindows.loading)
        this.showAndFocusWindow(AppWindows.main)
        this.setupSystemTray()
    }

    private createWindow(
        name: string,
        options: Electron.BrowserWindowConstructorOptions
    ) {
        const { webPreferences } = options
        options = {
            ...options,
            webPreferences: {
                nodeIntegration: false,
                ...webPreferences
            }
        }

        const window = new BrowserWindow(options)
        this.windows.set(name, window)
        window.on("closed", () => {
            this.windows.delete(name)
        })
        window.webContents.on(
            "before-input-event",
            (event: Electron.Event, input: Electron.Input) => {
                if (input.key === "F12" && input.type === "keyDown") {
                    window.webContents.openDevTools()
                }
            }
        )
        return window
    }

    private setupIpc() {
        ipcMain.on(WebEvents.APP.READY, () => this.webReady())
        ipcMain.on(WebEvents.APP.QUIT, () => this.quit())
    }
}

export { Application }
