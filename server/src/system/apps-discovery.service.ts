import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { AppInfo } from './interfaces/app-info.interface';

@Injectable()
export class AppsDiscoveryService {
    private readonly logger = new Logger(AppsDiscoveryService.name);

    // Diretórios padrão de apps no Linux (FreeDesktop Specification)
    private readonly appDirs = [
        path.join(os.homedir(), '.local', 'share', 'applications'),
        '/usr/local/share/applications',
        '/usr/share/applications',
        '/var/lib/snapd/desktop/applications',
        '/var/lib/flatpak/exports/share/applications',
    ];

    async listInstalledApps(): Promise<AppInfo[]> {
        const appsMap = new Map<string, AppInfo>();

        for (const dir of this.appDirs) {
            try {
                const files = await fs.readdir(dir);
                const desktopFiles = files.filter((f) => f.endsWith('.desktop'));

                for (const file of desktopFiles) {
                    // Se já encontramos uma versão mais local do app (ex: ~/.local sobrepõe /usr/share), ignora
                    if (appsMap.has(file)) continue;

                    const filePath = path.join(dir, file);
                    const app = await this.parseDesktopFile(file, filePath);
                    if (app) {
                        appsMap.set(file, app);
                    }
                }
            } catch (err: any) {
                // Se a pasta não existir (ex: máquina sem Snap ou Flatpak), apenas ignora silenciosamente
                if (err.code !== 'ENOENT') {
                    this.logger.warn(`Erro ao ler diretório ${dir}: ${err.message}`);
                }
            }
        }

        return Array.from(appsMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
        );
    }

    private async parseDesktopFile(id: string, filePath: string): Promise<AppInfo | null> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');

            // 1. Isola apenas a seção [Desktop Entry] (até a próxima seção '[' ou fim do arquivo)
            const entrySectionMatch = content.match(/\[Desktop Entry\]([\s\S]*?)(?=\n\[|$)/);
            if (!entrySectionMatch) return null;

            const section = entrySectionMatch[1];

            // Helper com regex para capturar o valor de uma chave específica na seção
            const getVal = (key: string) =>
                section.match(new RegExp(`^${key}\\s*=\\s*(.*)$`, 'm'))?.[1]?.trim();

            // 2. Extrai e valida NoDisplay
            if (getVal('NoDisplay')?.toLowerCase() === 'true') {
                return null;
            }

            // 3. Extrai os campos essenciais
            const name = getVal('Name');
            const rawExec = getVal('Exec');

            if (!name || !rawExec) return null;

            // Remove marcadores de argumentos (%u, %F, etc.)
            const exec = rawExec.replace(/%[a-zA-Z]/g, '').trim();

            return {
                id,
                name,
                exec,
                icon: getVal('Icon') || undefined,
                terminal: getVal('Terminal')?.toLowerCase() === 'true',
            };
        } catch {
            return null;
        }
    }
}