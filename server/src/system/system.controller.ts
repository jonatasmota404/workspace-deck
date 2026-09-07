import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
    constructor(private readonly systemService: SystemService){}

    @Get('test')
    async test(){
        return this.systemService.workspace_comands('echo "Deck conectado com sucesso!"')
    }
}
