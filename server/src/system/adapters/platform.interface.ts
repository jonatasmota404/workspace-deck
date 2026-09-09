export interface PlatformAdapter{
    openUrl(url:string):string;
    openPath(path:string):string;
    launchApp(app:string, args?: string): string;
    runShell(comand:string):string;
}