import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export enum ActionType{
    WORKSPACE = 'WORKSPACE',
    MEDIA = 'MEDIA',
    SYSTEM_INFO = 'SYSTEM_INFO',
    OPEN_URL = 'OPEN_URL'
}

export class ExecutionActionDto{
    @IsEnum(ActionType, {message: 'Ação inválida.'})
    @IsNotEmpty()
    action: ActionType;

    @IsString()
    @IsOptional()
    target?: string;
}