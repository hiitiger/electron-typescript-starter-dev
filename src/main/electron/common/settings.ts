import * as fs from "fs"

class PersistenceSettings {
    private config: any
    constructor() {
        this.loadFromFile()
    }

    public loadFromFile() {
        if (fs.existsSync(global.CONFIG.settingsFile)) {
            try {
                this.config = JSON.parse(
                    fs.readFileSync(global.CONFIG.settingsFile, "utf8")
                )
            } catch (err) {
                console.log(err)
                this.config = {}
            }
        } else {
            this.config = {}
        }
    }

    public get(name: string) {
        return this.config ? this.config[name] : undefined
    }

    public set(name: string, value: any) {
        this.config[name] = value
    }

    public save() {
        return new Promise((resolve, reject) => {
            fs.writeFile(
                global.CONFIG.settingsFile,
                JSON.stringify(this.config),
                { encoding: "utf-8" },
                (error) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve()
                }
            )
        })
    }
}

const settings = new PersistenceSettings()

export { settings }
