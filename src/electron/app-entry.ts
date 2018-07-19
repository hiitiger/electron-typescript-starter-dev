import { app as ElectronApp, BrowserWindow } from "electron";
import { Menu, Tray } from "electron";
import { ipcMain } from "electron";
import { shell } from "electron";
import * as path from "path";

enum AppWindows {
    main = "main",
    loading = "loading",
}

class Application {
    private windows: Map<string, Electron.BrowserWindow>;
    private appDir: string;
    private tray: Electron.Tray | null;
    private markQuit = false;

    constructor() {
        this.windows = new Map();
        this.appDir = "";
        this.tray = null;
    }

    get mainWindow() {
        return this.windows.get(AppWindows.main) || null;
    }

    set mainWindow(window: Electron.BrowserWindow | null) {
        if (!window) {
            this.windows.delete(AppWindows.main);
        } else {
            this.windows.set(AppWindows.main, window);
            window.on("closed", () => {
                this.mainWindow = null;
            });

            window.loadURL(global.CONFIG.entryUrl);

            window.on("ready-to-show", () => {
                this.webReady();
            });

            window.webContents.on("did-fail-load", () => {
                window.reload();
            });

            window.on("close", (event) => {
                if (this.markQuit) {
                    return;
                }
                event.preventDefault();
                window.hide();
                return false;
            });

            if (global.DEBUG) {
                window.webContents.openDevTools();
            }
        }
    }

    public init(appDir: string) {
        this.appDir = appDir;
    }

    public getWindow(window: AppWindows) {
        return this.windows.get(window) || null;
    }

    public createMainWindow() {
        const options = {
            height: 600,
            width: 800,
            show: false,
        };
        const mainWindow = this.createWindow(AppWindows.main, options);
        this.mainWindow = mainWindow;
        return mainWindow;
    }

    public openMainWindow() {
        let mainWindow = this.mainWindow;
        if (!mainWindow) {
            mainWindow = this.createMainWindow();
        }
        mainWindow!.show();
        mainWindow!.focus();
    }

    public closeMainWindow() {
        const mainWindow = this.mainWindow;
        if (mainWindow) {
            mainWindow.close();
        }
    }

    public closeAllWindows() {
        const windows = this.windows.values();
        for (const window of windows) {
            window.close();
        }
    }

    public openLoadingWindow() {
        let loadingWindow = this.getWindow(AppWindows.loading);
        if (!loadingWindow) {
            const options = {
                width: 360,
                height: 600,
                show: false,
            };
            loadingWindow = this.createWindow(AppWindows.loading, options);
            loadingWindow.loadURL(global.CONFIG.loadingUrl);
        }
        loadingWindow.show();
    }

    public closeWindow(name: AppWindows) {
        const window = this.windows.get(name);
        if (window) {
            window.close();
        }
    }

    public hideWindow(name: AppWindows) {
        const window = this.windows.get(name);
        if (window) {
            window.hide();
        }
    }

    public showAndFocusWindow(name: AppWindows) {
        const window = this.windows.get(name);
        if (window) {
            window.show();
            window.focus();
        }
    }

    public setupSystemTray() {
        if (!this.tray) {
            this.tray = new Tray(path.join(this.appDir, "assets/icon-16.png"));
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: "OpenMainWindow",
                    click: () => {
                        this.showAndFocusWindow(AppWindows.main);
                    },
                },
                {
                    label: "About",
                    click: () => {
                        this.showAbout();
                    },
                },
                {
                    label: "Quit",
                    click: () => {
                        this.quit();
                    },
                },
            ]);
            this.tray.setToolTip("WelCome");
            this.tray.setContextMenu(contextMenu);

            this.tray.on("click", () => {
                this.showAndFocusWindow(AppWindows.main);
            });
        }
    }

    public start() {
        if (!this.mainWindow) {
            this.createMainWindow();
            this.openLoadingWindow();
        } else {
            this.webReady();
        }
    }

    public webReady() {
        this.closeWindow(AppWindows.loading);
        this.showAndFocusWindow(AppWindows.main);
        this.setupSystemTray();
    }

    public activate() {
        this.openMainWindow();
    }

    public quit() {
        this.markQuit = true;
        this.closeMainWindow();
        this.closeAllWindows();
        if (this.tray) {
            this.tray.destroy();
        }
    }

    public showAbout() {
        this.openLink(path.join(this.appDir, "./index/about.txt"));
    }

    public openLink(url: string) {
        shell.openExternal(url);
    }

    private createWindow(
        name: AppWindows,
        option: Electron.BrowserWindowConstructorOptions,
    ) {
        const window = new BrowserWindow(option);
        this.windows.set(name, window);
        window.on("closed", () => {
            this.windows.delete(name);
        });
        return window;
    }
}

export { Application };
