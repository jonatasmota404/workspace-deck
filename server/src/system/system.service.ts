import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ExecutionActionDto } from './dto/execute-action.dto';
import { PlatformAdapter } from './interfaces/platform.interface';
import { LinuxAdapter } from './adapters/linux.adapter';
import { RoutineStep } from './dto/routine.dto';

const execPromise = promisify(exec);

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

    private resolveComands(step: RoutineStep): string {
        switch (step.type) {
            case 'OPEN_URL':
                return this.adapter.openUrl(step.target || '');
            case 'OPEN_PATH':
                return this.adapter.openPath(step.target || '');
            case 'LAUNCH_APP':
                return this.adapter.launchApp(step.target || '', step.args);
            case 'KILL_APP':
                return this.adapter.killApp(step.target || '');

            case 'VOLUME_UP':
                return this.adapter.volumeUp(step.target);
            case 'VOLUME_DOWN':
                return this.adapter.volumeDown(step.target);
            case 'VOLUME_MUTE':
                return this.adapter.toggleMute();
            case 'VOLUME_SET':
                return this.adapter.setVolume(step.target || '50%');

            case 'MEDIA_PLAY_PAUSE':
                return this.adapter.mediaPlayPause();
            case 'MEDIA_NEXT':
                return this.adapter.mediaNext();
            case 'MEDIA_PREV':
                return this.adapter.mediaPrev();

            case 'LOCK_SCREEN':
                return this.adapter.lockScreen();
            case 'NOTIFY':
                return this.adapter.notify(step.target || 'Workspace Deck', step.args);

            case 'RUN_SHELL':
                return this.adapter.runShell(step.target || '');

            default:
                throw new Error(`Tipo de ação não suportado: ${(step as any).type}`);
        }
    }

    public async executeRoutine(steps: RoutineStep[]): Promise<void> {
    for (const step of steps) {
      if (step.type === 'DELAY') {
        const ms = Number.parseInt(step.target || '1000', 10);
        this.logger.log(`Aguardando delay de ${ms}ms...`);
        await new Promise((resolve) => setTimeout(resolve, ms));
        continue;
      }

      const command = this.resolveComands(step);
      this.logger.log(`Executando passo [${step.type}]: ${command}`);

      try {
        await execPromise(command);
      } catch (error: any) {
        this.logger.error(`Falha no passo ${step.type}: ${error.message}`);
      }
    }
  }
}
