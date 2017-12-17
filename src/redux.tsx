import { AnyAction, combineReducers } from 'redux';
import { isUndefined } from 'util';
import {
    DefaultApiFactory, login_FAILURE, login_SUCCESS, LoginParams, smsCode_FAILURE, smsCode_SUCCESS, SmsCodeParams,
    smsLogin_FAILURE,
    smsLogin_SUCCESS,
    SmsLoginParams
} from './api/account-private/gen/api';
import { Dispatchable, StandardAction } from './_common/action';
import { Dispatch } from 'react-redux';
import { TextTimestamp } from './_common/TimedText';

let accountApi = DefaultApiFactory(fetch, 'http://127.0.0.1:8083/api-private/v1/accounts' );

export interface RootState {
    jwt: string;
    errorMessage: TextTimestamp;
    smsCodeSentMessage: TextTimestamp;
}

export function apiSmsCode(params: SmsCodeParams): Dispatchable {
    return function (dispatch: Dispatch<StandardAction>) {
        return accountApi.smsCode(params).then(() => {
            dispatch({type: smsCode_SUCCESS});
        }).catch((err) => {
            dispatch({type: smsCode_FAILURE, error: true, payload: err});
        });
    };
}

export function apiSmsLogin(params: SmsLoginParams): Dispatchable {
    return function (dispatch: Dispatch<StandardAction> ) {
        return accountApi.smsLogin(params).then((data) => {
            dispatch({type: smsLogin_SUCCESS, payload: data});
        }).catch((err) => {
            dispatch({type: smsLogin_FAILURE, error: true, payload: err});
        });
    };
}

export function apiLogin(params: LoginParams): Dispatchable {
    return function (dispatch: Dispatch<StandardAction>) {
        return accountApi.login(params).then((data) => {
            dispatch({type: login_SUCCESS, payload: data});
        }).catch((err) => {
            dispatch({type: login_FAILURE, error: true, payload: err});
        });
    };
}

function jwt(state: string, action: AnyAction): string {
    if (isUndefined(state)) {
        return '';
    }

    switch (action.type) {
        case login_SUCCESS:
            return action.payload;
        case smsLogin_SUCCESS:
            return action.payload;
        default:
            return state;
    }
}

function errorMessage(state: TextTimestamp, action: StandardAction): TextTimestamp {
    if (isUndefined(state)) {
        return {text: '', timestamp: new Date()};
    }

    switch (action.type) {
        case smsCode_FAILURE:
        case login_FAILURE:
        case smsLogin_FAILURE:
            return {text: action.payload.message, timestamp: new Date()};
        default:
            return state;
    }
}

function smsCodeSentMessage(state: TextTimestamp, action: StandardAction): TextTimestamp {
    if (isUndefined(state)) {
        return {text: '', timestamp: new Date()};
    }

    switch (action.type) {
        case smsCode_SUCCESS:
            return {text: '验证码已发送', timestamp: new Date()};
        default:
            return state;
    }
}

export const rootReducer = combineReducers({
    jwt,
    errorMessage,
    smsCodeSentMessage
});