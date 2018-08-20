declare namespace NodeJS {
    export interface Global {
        DEBUG: any;
        CONFIG: {
            distDir: string;
            loadingUrl: string;
            entryUrl: string;
            endPoint: string;
            appDataDir: string;
            settingsFile: string;
        };
    }
}
