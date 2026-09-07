import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SystemService } from './system.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class SystemGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SystemGateway.name);

  constructor(private readonly systemService: SystemService){}

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Cliente conectado: ${client.id}`)
  }

  handleDisconnect(client: any, reason?: string) {
    this.logger.warn(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('execute_comand')
  async comandExecution(@MessageBody() comand: string){
    return await this.systemService.workspace_comands(comand)
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
