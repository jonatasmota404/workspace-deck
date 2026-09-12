import { PlatformAdapter } from "../interfaces/platform.interface";

export class LinuxAdapter implements PlatformAdapter {

    openUrl(url: string): string {
        return `nohup xdg-open "${url}" >/dev/null 2>&1 &`;
    }

    openPath(path: string): string {
        return `nohup xdg-open "${path}" >/dev/null 2>&1 &`;
    }

    launchApp(target: string, args?: string): string {
        const extraArgs = args ? ` ${args}` : '';
        return `nohup ${target}${extraArgs} >/dev/null 2>&1 &`;
    }

    killApp(appName: string): string {
        return `killall "${appName}"`;
    }

    // --- Áudio (suporta PipeWire nativo com fallback para pactl) ---
    volumeUp(step = '5%'): string {
        // wpctl (PipeWire moderno) ou pactl (PulseAudio)
        return `wpctl set-volume -l 1.5 @DEFAULT_AUDIO_SINK@ ${step}+ 2>/dev/null || pactl set-sink-volume @DEFAULT_SINK@ +${step}`;
    }

    volumeDown(step = '5%'): string {
        return `wpctl set-volume @DEFAULT_AUDIO_SINK@ ${step}- 2>/dev/null || pactl set-sink-volume @DEFAULT_SINK@ -${step}`;
    }

    toggleMute(): string {
        return `wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle 2>/dev/null || pactl set-sink-mute @DEFAULT_SINK@ toggle`;
    }

    setVolume(percent = '50%'): string {
        const decimal = (parseInt(percent, 10) / 100).toFixed(2);
        return `wpctl set-volume @DEFAULT_AUDIO_SINK@ ${decimal} 2>/dev/null || pactl set-sink-volume @DEFAULT_SINK@ ${percent}`;
    }

    // --- Mídia (playerctl) ---
    mediaPlayPause(): string {
        return `playerctl play-pause 2>/dev/null || true`;
    }

    mediaNext(): string {
        return `playerctl next 2>/dev/null || true`;
    }

    mediaPrev(): string {
        return `playerctl previous 2>/dev/null || true`;
    }

    // --- Sistema ---
    lockScreen(): string {
        return `loginctl lock-session 2>/dev/null || xdg-screensaver lock`;
    }

    notify(title: string, message = ''): string {
        return `notify-send "${title}" "${message}"`;
    }

    runShell(command: string): string {
        return command;
    }
}