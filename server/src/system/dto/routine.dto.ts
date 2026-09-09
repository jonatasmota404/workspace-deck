export type PrimitiveType = 'OPEN_URL' | 'OPEN_PATH' | 'LAUNCH_APP' | 'RUN_SHELL';


export interface RoutineStep{
    type: PrimitiveType;
    target: string;
    args?: string;
}

export interface DeckRoutine {
    id: string;
    label: string;
    steps: RoutineStep[];
}