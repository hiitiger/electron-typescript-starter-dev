import { app as ElectronApp, BrowserWindow } from "electron";
import { ipcMain } from "electron";

enum AppWindows {
    main = "main",
    loading = "loading",
}

class Application {
    private windows: Map<string, Electron.BrowserWindow>;
    private appDir: string;
    private closed = false;
    constructor() {
        this.windows = new Map();
        this.appDir = "";
    }

    get mainWindow() {
        return this.windows.get(AppWindows.main) || null;
    }

    set mainWindow(win: Electron.BrowserWindow | null) {
        if (!win) {
            this.windows.delete(AppWindows.main);
        } else {
            this.windows.set(AppWindows.main, win);

            win.webContents.openDevTools();

            win.on("closed", () => {
                this.mainWindow = null;
            });
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
        this.mainWindow = this.createWindow(AppWindows.main, options);
        this.mainWindow.loadURL(global.CONFIG.entryUrl);
    }

    public openMainWindow() {
        if (!this.mainWindow) {
            this.createMainWindow();
        }

        this.mainWindow!.show();
    }

    public closeMainWindow() {
        const mainWindow = this.mainWindow;
        if (mainWindow) {
            mainWindow.close();
        }
    }

    public closeAllWindow() {
        const windows = this.windows.values();
        for (const window of windows) {
            window.close();
        }
    }

    public openLoadingWindow() {
        if (!this.getWindow(AppWindows.loading)) {
            const options = {
                width: 360,
                height: 600,
            };
            const window = this.createWindow(AppWindows.loading, options);

            window.loadURL(global.CONFIG.loadingUrl);
            window.webContents.on("did-finish-load", () => {
                setTimeout(() => {
                    this.openMainWindow();
                    window.close();
                }, 3000);
            });
        }
    }

    public start() {
        if (!this.mainWindow) {
            this.createMainWindow();
        }
        this.openLoadingWindow();
    }

    public quit() {
        this.closeMainWindow();
        this.closeAllWindow();
    }

    private createWindow(
        name: AppWindows,
        option: Electron.BrowserWindowConstructorOptions,
    ) {
        const window = new BrowserWindow(option);
        this.windows.set(name, window);

        window.on("close", () => {
            this.windows.delete(name);
        });

        return window;
    }
}

export { Application };
