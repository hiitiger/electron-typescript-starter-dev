declare namespace NodeJS {
    export interface Global {
        DEBUG: any;
        CONFIG: {
            loadingUrl: string;
            entryUrl: string;
        };
    }
}
