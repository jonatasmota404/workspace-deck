import { PlatformAdapter } from "./platform.interface";

export class LinuxAdapter implements PlatformAdapter {

    openUrl(url: string): string {
        return `xdg-open "${url}"`;
    }

    openPath(path: string): string {
        return `xdg-open "${path}"`;
    }

    launchApp(app: string, args?: string): string {
        return args ? `${app} ${args} &` : `${app} &`;
    }

    runShell(comand: string): string {
        return comand;
    }
}