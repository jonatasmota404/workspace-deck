import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const comandsArray: string[] = ['echo "Deck conectado com sucesso!"', 'uname -a'];
const execPromisse = promisify(exec);

@Injectable()
export class SystemService {
    private readonly logger = new Logger(SystemService.name);
    public async workspace_comands(comand:string): Promise<string> {
        try {
            const validComand = comandsArray.find(i => i === comand)
            if (!validComand) {
                throw new Error('Invalid comand');
            }

            const {stdout, stderr} = await execPromisse(comand);

            if (stderr) {
                Logger.error(stderr)
            }
            return stdout;
        } catch (error) {
            this.logger.error(error)
            throw new Error('Erro na execução do comando');
        }
    }
}
