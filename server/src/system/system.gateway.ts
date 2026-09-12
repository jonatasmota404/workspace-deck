import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SystemService } from './system.service';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExecutionActionDto } from './dto/execute-action.dto';
import { DeckRoutine, DeckRoutineDto, RoutineStep } from './dto/routine.dto';
import { ConfigService } from './config.service';
import { AppsDiscoveryService } from './apps-discovery.service';
import { AppInfo } from './interfaces/app-info.interface';

@WebSocketGateway({ cors: { origin: '*' } })
export class SystemGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SystemGateway.name);

  constructor(private readonly systemService: SystemService, 
    private readonly configService: ConfigService,
    private readonly appsDiscoveryService: AppsDiscoveryService
  ) {}

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Cliente conectado: ${client.id}`)
  }

  handleDisconnect(client: any, reason?: string) {
    this.logger.warn(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('deck:get_routines')
  handleGetRoutines(): DeckRoutine[] {
    return this.configService.getRoutines();
  }

  @SubscribeMessage('deck:trigger_routine')
  async handleTriggerRoutine(@MessageBody() payload: { id: string }): Promise<{ success: boolean; message: string }> {

    const routine = this.configService.getRoutines().find(r => r.id === payload.id);

    if (!routine) {
      this.logger.error(`Rotina ${payload.id} não encontrada`);
      return { success: false, message: 'Rotina não encontrada' };
    }

    this.logger.log(`Disparando rotina: ${routine.label}`);
    await this.systemService.executeRoutine(routine.steps);

    return { success: true, message: `Rotina ${routine.label} executada!` };
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('execute_comand')
  async comandExecution(@MessageBody() steps: RoutineStep[]): Promise<{ status: string }> {
    await this.systemService.executeRoutine(steps);
    return { status: 'ok' };
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('deck:save_routine')
  async handleSaveRoutine(@MessageBody() routineDto: DeckRoutineDto): Promise<{ success: boolean; message: string }> {
    await this.configService.saveRoutine(routineDto);
    this.logger.log(`Rotina salva com sucesso: ${routineDto.label}`);
    return { success: true, message: `Rotina ${routineDto.label} salva!` };
  }

  @SubscribeMessage('deck:get_apps')
  async handleGetApps(): Promise< AppInfo[]> {
    return this.appsDiscoveryService.listInstalledApps();
  }
}
