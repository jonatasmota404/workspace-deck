import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export enum PrimitiveType {
  // Navegação e Apps
  OPEN_URL = 'OPEN_URL',
  OPEN_PATH = 'OPEN_PATH',
  LAUNCH_APP = 'LAUNCH_APP',
  KILL_APP = 'KILL_APP',

  // Controle de Áudio
  VOLUME_UP = 'VOLUME_UP',
  VOLUME_DOWN = 'VOLUME_DOWN',
  VOLUME_MUTE = 'VOLUME_MUTE',
  VOLUME_SET = 'VOLUME_SET',

  // Controle de Mídia (via MPRIS / playerctl)
  MEDIA_PLAY_PAUSE = 'MEDIA_PLAY_PAUSE',
  MEDIA_NEXT = 'MEDIA_NEXT',
  MEDIA_PREV = 'MEDIA_PREV',

  // Sistema & Utilitários
  LOCK_SCREEN = 'LOCK_SCREEN',
  NOTIFY = 'NOTIFY',
  DELAY = 'DELAY',
  RUN_SHELL = 'RUN_SHELL',
}

export interface RoutineStep{
    type: PrimitiveType;
    target?: string;
    args?: string;
}

export interface DeckRoutine {
    id: string;
    label: string;
    steps: RoutineStep[];
}

export class RoutineStepDto implements RoutineStep {
    @IsEnum(PrimitiveType)
    @IsNotEmpty()
    type: PrimitiveType;

    @IsString()
    @IsOptional()
    target?: string;

    @IsOptional()
    @IsString()
    args?: string;
}

export class DeckRoutineDto implements DeckRoutine{
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    label: string;

    @IsArray()
    @ValidateNested({each:true})
    @Type(()=>RoutineStepDto)
    steps: RoutineStepDto[];
}