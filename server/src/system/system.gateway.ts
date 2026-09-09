import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SystemService } from './system.service';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExecutionActionDto } from './dto/execute-action.dto';
import { DeckRoutine, RoutineStep } from './dto/routine.dto';
import { ConfigService } from './config.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class SystemGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SystemGateway.name);

  constructor(private readonly systemService: SystemService, private readonly configService: ConfigService){}

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
  async handleTriggerRoutine(@MessageBody() payload: {id: string}): Promise<{success:boolean; message:string}> {

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
  async comandExecution(@MessageBody() steps: RoutineStep[]): Promise<{status: string}>{
    await this.systemService.executeRoutine(steps);
    return {status:'ok'};
  }
}
