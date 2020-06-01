import electron from "electron";
import * as fs from "fs";
import * as path from "path";

export interface IFsOperationsOpts {
    /**
     * the name of the file (including the extention)
     *
     * @type {string}
     * @memberof IFsOperationsOpts
     */
    fileName: string;
    /**
     * the default value of the file
     *
     * @type {*}
     * @memberof IFsOperationsOpts
     */
    defaults: any;
    /**
     * ! NOT RECOMMENDED TO USE 
     * | the Path of the file (without the filename and extention)
     * | defaults to the userData Path of the electron application
     *
     * @type {string}
     * @memberof IFsOperationsOpts
     */
    path?: string;
};

export class FsOperations {

    private path: string;
    private data: any;
    private default: any;

    constructor(opts: IFsOperationsOpts) {
        // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
        // app.getPath('userData') will return a string of the user's app data directory path.
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        if (opts.path) {
            this.path = path.join(opts.path, opts.fileName);
        } else {
            const userDataPath = (electron.app || electron.remote.app).getPath('userData');
            this.path = path.join(userDataPath, opts.fileName);
        }

        this.get(true)
            .then((value: string | Object) => {
                this.data = value;
            });

        this.default = opts.defaults;
    }

    public get(readFromDisk?: boolean): Promise<Object | string> {
        if (!readFromDisk) {
            readFromDisk = false;
        }
        return new Promise<Object>((resolve, reject) => {
            if (readFromDisk) {
                this.manualGet().then((buffer: Buffer) => {
                    if (buffer) {
                        resolve(this.convertBufferToJSONObject(buffer));
                    } else {
                        resolve(this.default);
                    }
                })
            } else {
                resolve(this.data);
            }
        });
    }

    public set(data: any) {
        this.data = data;
        if (typeof data == "object") {
            this.manualSet(JSON.stringify(data));
        } else {
            this.manualSet(data);
        }

    }

    public convertBufferToJSONObject(buffer: Buffer): Object | string {
        try {
            let json = JSON.parse(buffer.toString());
            return json;
        } catch (error) {
            return buffer.toString();
        }
    }

    public manualSet(data: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.data = data;
            let success = true;
            try {
                fs.writeFileSync(this.path, data);
            } catch (error) {
                success = false;
            }
            resolve(success);
        })
    }

    public manualGet(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            let buffer: Buffer;
            try {
                buffer = fs.readFileSync(this.path);
                resolve(buffer);
            } catch (error) {
                resolve(undefined);
            }

        })
    }
}
