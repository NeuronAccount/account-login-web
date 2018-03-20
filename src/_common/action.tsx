import { Dispatch } from 'react-redux';

export interface StandardAction {
    type: string;
    error?: boolean;
    payload?: any;
}

export type Dispatchable= (dispatch: Dispatch<StandardAction>) => void;