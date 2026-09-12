import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { PrimitiveType } from '../src/system/dto/routine.dto';

describe('Workspace Deck (E2E via WebSocket)', () => {
  let app: INestApplication;
  let clientSocket: Socket;
  const PORT = 3001;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(PORT);

    clientSocket = io(`http://localhost:${PORT}`);
    await new Promise<void>((resolve) => clientSocket.on('connect', () => resolve()));
  });

  afterAll(async () => {
    clientSocket.disconnect();
    await app.close();
  });

  it('deve listar as rotinas cadastradas via deck:get_routines', () => {
    return new Promise<void>((resolve) => {
      clientSocket.emit('deck:get_routines', (routines: any[]) => {
        expect(Array.isArray(routines)).toBe(true);
        expect(routines.length).toBeGreaterThan(0);
        resolve();
      });
    });
  });

  it('deve salvar uma nova rotina e persistir', () => {
    const novaRotina = {
      id: 'btn_e2e_test',
      label: 'Teste E2E',
      steps: [{ type: 'OPEN_URL', target: 'https://nestjs.com' }],
    };

    return new Promise<void>((resolve) => {
      clientSocket.emit('deck:save_routine', novaRotina, (res: any) => {
        expect(res.success).toBe(true);

        clientSocket.emit('deck:get_routines', (routines: any[]) => {
          const encontrada = routines.find((r) => r.id === 'btn_e2e_test');
          expect(encontrada).toBeDefined();
          expect(encontrada.label).toBe('Teste E2E');
          resolve();
        });
      });
    });
  });

  it('deve listar os apps instalados no sistema via deck:get_apps', () => {
    return new Promise<void>((resolve) => {
      clientSocket.emit('deck:get_apps', (apps: any[]) => {
        expect(Array.isArray(apps)).toBe(true);
        expect(apps.length).toBeGreaterThan(0);

        // Valida a estrutura do primeiro aplicativo encontrado
        const firstApp = apps[0];
        expect(firstApp).toHaveProperty('id');
        expect(firstApp).toHaveProperty('name');
        expect(firstApp).toHaveProperty('exec');
        expect(typeof firstApp.terminal).toBe('boolean');

        resolve();
      });
    });
  });

  it('deve executar uma rotina em cascata via deck:trigger_routine', () => {
    const payloadTrigger = {
      id: 'btn_e2e_test',
    };

    return new Promise<void>((resolve) => {
      clientSocket.emit('deck:trigger_routine', payloadTrigger, (res: any) => {
        expect(res).toBeDefined();
        expect(res.success).toBe(true);
        resolve();
      });
    });
  });

  it('deve salvar e persistir uma rotina complexa com múltiplas primitivas', () => {
    const rotinaComplexa = {
      id: 'routine_full_chain',
      label: 'Cadeia Completa de Comandos',
      steps: [
        {
          type: PrimitiveType.NOTIFY,
          target: 'Workspace Deck',
          args: 'Iniciando rotina de testes...',
        },
        {
          type: PrimitiveType.VOLUME_SET,
          target: '30%',
        },
        {
          type: PrimitiveType.VOLUME_UP,
          target: '5%',
        },
        {
          type: PrimitiveType.VOLUME_DOWN,
          target: '5%',
        },
        {
          type: PrimitiveType.VOLUME_MUTE,
          target: '',
        },
        {
          type: PrimitiveType.MEDIA_PLAY_PAUSE,
          target: '',
        },
        {
          type: PrimitiveType.MEDIA_NEXT,
          target: '',
        },
        {
          type: PrimitiveType.MEDIA_PREV,
          target: '',
        },
        {
          type: PrimitiveType.DELAY,
          target: '50',
        },
        {
          type: PrimitiveType.RUN_SHELL,
          target: 'echo "Executando passo final em shell"',
        },
      ],
    };

    return new Promise<void>((resolve) => {
      clientSocket.emit('deck:save_routine', rotinaComplexa, (res: any) => {
        expect(res).toBeDefined();
        expect(res.success).toBe(true);

        clientSocket.emit('deck:get_routines', (routines: any[]) => {
          const encontrada = routines.find((r) => r.id === 'routine_full_chain');
          expect(encontrada).toBeDefined();
          expect(encontrada.steps.length).toBe(10);
          resolve();
        });
      });
    });
  });
  it('deve disparar a execução da rotina complexa via deck:trigger_routine', () => {
    const payloadTrigger = {
      id: 'routine_full_chain',
    };

    return new Promise<void>((resolve) => {
      clientSocket.emit('deck:trigger_routine', payloadTrigger, (res: any) => {
        expect(res).toBeDefined();
        expect(res.success).toBe(true);
        resolve();
      });
    });
  });
});