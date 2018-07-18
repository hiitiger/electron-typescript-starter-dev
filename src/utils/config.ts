import * as path from "path";
import "./debug";

function fileUrl(str: string) {
    let pathName = path.resolve(str).replace(/\\/g, "/");

    // Windows drive letter must be prefixed with a slash
    if (pathName[0] !== "/") {
        pathName = "/" + pathName;
    }

    return encodeURI("file://" + pathName);
}

const CONFIG: any = {};

if (global.DEBUG) {
    CONFIG.entryUrl = fileUrl(path.join(__dirname, "../index/index.html"));
} else {
    CONFIG.entryUrl = "https://duckduckgo.com";
}

CONFIG.loadingUrl = fileUrl(
    path.join(__dirname, "../index/loading/loading.html"),
);

global.CONFIG = CONFIG;

export default CONFIG;
