import { AnyAction, combineReducers } from 'redux';
import { isUndefined } from 'util';
import { DefaultApiFactory } from './api/account-private/gen/api';

let accountApi = DefaultApiFactory(fetch, 'http://127.0.0.1:8083/api-private/v1/accounts' );

export interface RootState {
    jwt: string;
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

function dispatchResponseError(dispatch: (action: AnyAction) => void , actionType: string, payload: {}) {
    dispatch({type: actionType, error: true, payload: payload});
    dispatch(errorMessage({message: JSON.stringify(payload)}));
}

function errorFromResponse(response: {}): Promise<ApiError> {
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

export interface SmsCodeParams {
    scene: string;
    phone: string;
    captchaId?: string;
    captchaCode?: string;
}
export const SMS_CODE_REQUEST = 'SMS_CODE_REQUEST';
export const SMS_CODE_SUCCESS = 'SMS_CODE_SUCCESS';
export const SMS_CODE_FAILURE = 'SMS_CODE_FAILURE';
export function apiSmsCode(params: SmsCodeParams,
                           onSuccess: () => void,
                           onError: (err: ApiError) => void): (dispatch: (action: AnyAction) => void) => void {
    console.log('apiSmsCode', params);
    return function (dispatch: (action: AnyAction) => void) {
        dispatch({type: SMS_CODE_REQUEST});
        return accountApi.smsCode(params).then(() => {
            dispatch({type: SMS_CODE_SUCCESS});
            onSuccess();
        }).catch((response) => {
            errorFromResponse(response).then((err) => {
                dispatchResponseError(dispatch, SMS_CODE_FAILURE, errorFromResponse(err));
                onError(err);
            });
        });
    };
}

export interface SmsLoginParams {
    phone: string;
    smsCode: string;
}
export const SMS_LOGIN_REQUEST = 'SMS_LOGIN_REQUEST';
export const SMS_LOGIN_SUCCESS = 'SMS_LOGIN_SUCCESS';
export const SMS_LOGIN_FAILURE = 'SMS_LOGIN_FAILURE';
export function apiSmsLogin(params: SmsLoginParams,
                            onSuccess: (jwt: string) => void,
                            onError: ((err: ApiError) => void)): (dispatch: (action: AnyAction) => void) => void {
    console.log('apiSmsLogin', params);
    return function (dispatch: (action: AnyAction) => void ) {
        dispatch({type: SMS_LOGIN_REQUEST});
        return accountApi.smsLogin(params).then((data) => {
            dispatch({type: SMS_LOGIN_SUCCESS, payload: data});
            onSuccess(data);
        }).catch((response) => {
            errorFromResponse(response).then((err) => {
                dispatchResponseError(dispatch, SMS_LOGIN_FAILURE, err);
                onError(err);
            });
        });
    };
}

export interface AccountLoginParams {
    name: string;
    password: string;
}
export const ACCOUNT_LOGIN_REQUEST = 'ACCOUNT_LOGIN_REQUEST';
export const ACCOUNT_LOGIN_SUCCESS = 'ACCOUNT_LOGIN_SUCCESS';
export const ACCOUNT_LOGIN_FAILURE = 'ACCOUNT_LOGIN_FAILURE';
export function apiAccountLogin(params: AccountLoginParams,
                                onSuccess: (jwt: string) => void,
                                onError: ((err: ApiError) => void)): (dispatch: (action: AnyAction) => void) => void {
    console.log('apiAccountLogin', params);
    return function (dispatch: (action: AnyAction) => void) {
        dispatch({type: ACCOUNT_LOGIN_REQUEST});
        return accountApi.login(params).then((data) => {
            dispatch({type: ACCOUNT_LOGIN_SUCCESS, payload: data});
            onSuccess(data);
        }).catch((response) => {
            errorFromResponse(response).then((err) => {
                dispatchResponseError(dispatch, ACCOUNT_LOGIN_FAILURE, err);
                onError(err);
            });
        });
    };
}

function loginResponse(jwt: string, action: AnyAction): string {
    if (isUndefined(jwt)) {
        return '';
    }

    switch (action.type) {
        case ACCOUNT_LOGIN_SUCCESS:
            return action.payload;
        case SMS_LOGIN_SUCCESS:
            return action.payload;
        default:
            return jwt;
    }
}

export const rootReducer = combineReducers({
    jwt: loginResponse
});