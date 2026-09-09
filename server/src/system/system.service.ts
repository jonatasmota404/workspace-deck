import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ExecutionActionDto } from './dto/execute-action.dto';
import { PlatformAdapter } from './adapters/platform.interface';
import { LinuxAdapter } from './adapters/linux.adapter';
import { RoutineStep } from './dto/routine.dto';

const execPromisse = promisify(exec);

@Injectable()
export class SystemService implements OnModuleInit {
    private readonly logger = new Logger(SystemService.name);
    private adapter!: PlatformAdapter;

    onModuleInit() {
        this.logger.log(`Detectando plataforma operacional: ${process.platform}`);
        if (process.platform === 'linux') {
            this.adapter = new LinuxAdapter();
        } else {
            throw new Error(`Plataforma não suportada: ${process.platform}`)
        }
    }

    private ResolveComands(step: RoutineStep){
        switch (step.type) {
            case 'OPEN_URL':
                return this.adapter.openUrl(step.target);
            case 'OPEN_PATH':
                return this.adapter.openPath(step.target);
            case 'LAUNCH_APP':
                return this.adapter.launchApp(step.target, step.args);
            case 'RUN_SHELL':
                return this.adapter.runShell(step.target);
            default:
                throw new Error(`Tipo de ação não suportado: ${(step as any).type}`);
        }
    }

    public async executeRoutine(steps: RoutineStep[]): Promise<void> {
        for (const step of steps){
            const command = this.ResolveComands(step);
            this.logger.log(`Executando passo [${step.type}]: ${command}`);

            try {
                await execPromisse(command);
            } catch (error: any) {
                this.logger.error(`Falha no passo ${step.type}: ${error.message}`)
            }
        }
    }
}
