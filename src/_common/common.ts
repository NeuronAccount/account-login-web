import { isUndefined } from 'util';
import { AnyAction } from 'redux';

export function  valueOrDefault(s: string|undefined): string {
    return isUndefined(s) ? '' : s;
}

export function isNullOrEmpty(s: string|undefined|null): boolean {
    if (isUndefined(s)) {
        return true;
    }

    if (s == null || s === '') {
        return true;
    }

    return false;
}

export function parseQueryString(search: string): Map<string, string> {
    let m = new Map<string, string>();
    if (search.startsWith('?')) {
        search.substring(1).split('&').forEach((pair) => {
            const tokens = pair.split('=');
            if (tokens.length > 1) {
                m.set(tokens[0], tokens[1]);
            } else {
                m.set(tokens[0], '');
            }
        });
    }
    return m;
}

export interface ApiError {
    status: number;
    code: string;
    message: string;
}

const ON_ERROR_MESSAGE = 'ON_ERROR_MESSAGE';
export function errorMessage( params: {message: string} ): AnyAction {
    return {
        type: ON_ERROR_MESSAGE,
        error: true,
        payload: {
            errorMessage: params.message
        },
    };
}

export function dispatchResponseError(dispatch: (action: AnyAction) => void , actionType: string, payload: {}) {
    dispatch({type: actionType, error: true, payload: payload});
    dispatch(errorMessage({message: JSON.stringify(payload)}));
}

export function errorFromResponse(response: {}): Promise<ApiError> {
    if (response instanceof Response) {
        return response.json().then((json: ApiError) => {
            return json;
        }).catch((err: {}) => {
            return {status: response.status, code: 'NetworkException', message: err.toString()};
        });
    } else if (response instanceof TypeError) {
        if (response.message === 'Failed to fetch') {
            return new Promise(function (resolve: (err: ApiError) => void) {
                resolve({status: 8193, code: 'NetworkException', message: '连接失败，请检查网络'});
            });
        } else {
            return new Promise(function (resolve: (err: ApiError) => void) {
                resolve({status: 8193, code: 'NetworkException', message: response.toString()});
            });
        }
    } else {
        return new Promise(function (resolve: (err: ApiError) => void) {
            resolve({status: 8193, code: 'NetworkException', message: '未知错误 response:' + response});
        });
    }
}