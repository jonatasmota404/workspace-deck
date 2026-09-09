import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as path from 'node:path';
import { DeckRoutine } from "./dto/routine.dto";
import { access, readFile, writeFile } from "node:fs/promises";

@Injectable()
export class ConfigService implements OnModuleInit {
    private readonly logger = new Logger(ConfigService.name);
    private readonly filePath: string = path.resolve(process.cwd(), 'deck-config.json');
    private routines: DeckRoutine[] = [];



    async onModuleInit(): Promise<void> {
        const SEEDS_INICIAIS: DeckRoutine[] = [
            {
                id: 'btn_system_info',
                label: 'Info do Sistema',
                steps: [{ type: 'RUN_SHELL', target: 'uname -a' }],
            },
            {
                id: 'btn_github',
                label: 'Abrir GitHub',
                steps: [{ type: 'OPEN_URL', target: 'https://github.com' }],
            },
        ];
        try {
            await access(this.filePath);

            const rawData = await readFile(this.filePath, 'utf-8');
            this.routines = JSON.parse(rawData);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                this.routines = SEEDS_INICIAIS;
                await writeFile(this.filePath, JSON.stringify(this.routines, null, 2), 'utf-8');
            } else {
                throw error;
            }
        }
    }

    public getRoutines(): DeckRoutine[] {
        return this.routines;
    }

    public async saveRoutine(routine: DeckRoutine): Promise<void> {
        const index = this.routines.findIndex(r => r.id === routine.id);

        if (index !== -1) {
            this.routines[index] = routine;
        } else {
            this.routines.push(routine);
        }

        await writeFile(this.filePath, JSON.stringify(this.routines, null, 2), 'utf-8');
    }
}