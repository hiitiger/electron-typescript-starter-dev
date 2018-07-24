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

CONFIG.distDir = path.join(__dirname, "../../");

if (global.DEBUG) {
    CONFIG.entryUrl = fileUrl(path.join(CONFIG.distDir, "index/index.html"));
    CONFIG.endPoint = fileUrl(path.join(CONFIG.distDir));
} else {
    CONFIG.entryUrl = "";
    CONFIG.endPoint = "";
}

CONFIG.loadingUrl = fileUrl(
    path.join(CONFIG.distDir, "index/loading/loading.html"),
);

global.CONFIG = CONFIG;

export default CONFIG;
