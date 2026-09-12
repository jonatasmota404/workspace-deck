export interface PlatformAdapter {
  openUrl(url: string): string;
  openPath(path: string): string;
  launchApp(app: string, args?: string): string;
  killApp(appName: string): string;

  volumeUp(stepPercent?: string): string;
  volumeDown(stepPercent?: string): string;
  toggleMute(): string;
  setVolume(percent: string): string;

  mediaPlayPause(): string;
  mediaNext(): string;
  mediaPrev(): string;

  lockScreen(): string;
  notify(title: string, message?: string): string;
  runShell(command: string): string;
}