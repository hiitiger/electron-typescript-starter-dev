import { app as ElectronApp, BrowserWindow } from "electron";
import { ipcMain } from "electron";

enum AppWindows {
    main = "main",
    loading = "loading"
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
            show: false
        };
        const mainWindow = this.createWindow(AppWindows.main, options);
        mainWindow.loadURL(global.CONFIG.entryUrl);

        mainWindow.on("ready-to-show", () => {
            this.closeWindow(AppWindows.loading);
            this.openMainWindow();
        });

        return mainWindow;
    }

    public openMainWindow() {
        let mainWindow = this.mainWindow;
        if (!mainWindow) {
            mainWindow = this.createMainWindow();
        }
        mainWindow!.show();
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
                show: false
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

    public start() {
        if (!this.mainWindow) {
            this.createMainWindow();
            this.openLoadingWindow();
        } else {
            this.openMainWindow();
        }
    }

    public activate() {
        this.openMainWindow();
    }

    public quit() {
        this.closeMainWindow();
        this.closeAllWindows();
    }

    private createWindow(
        name: AppWindows,
        option: Electron.BrowserWindowConstructorOptions
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
