import { PushAction } from '../utilities/sdk/Types.js';

export interface FileState {
    path: string,
    hash?: string,
}
export interface ThemeState {
    files: FileState[]
}

export type PushDeltaState = {
    [key in PushAction]: FileState[]
}
