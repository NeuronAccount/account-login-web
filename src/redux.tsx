import { combineReducers } from 'redux';
import { Dispatchable, StandardAction } from './_common/action';
import { TextTimestamp } from './_common/TimedText';
import {
    DefaultApiFactory, loginParams , smsCodeParams, smsLoginParams
} from './api/account-private/gen';

const LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const SMS_CODE_FAILURE = 'SMS_CODE_FAILURE';
const SMS_CODE_SUCCESS = 'SMS_CODE_SUCCESS';
const SMS_LOGIN_FAILURE = 'SMS_LOGIN_FAILURE';
const SMS_LOGIN_SUCCESS = 'SMS_LOGIN_SUCCESS';

const accountApi = DefaultApiFactory(undefined, fetch, 'http://127.0.0.1:8083/api-private/v1/accounts');

export interface RootState {
    jwt: string;
    errorMessage: TextTimestamp;
    smsCodeSentMessage: TextTimestamp;
}

export const apiSmsCode = (p: smsCodeParams): Dispatchable => (dispatch) => {
    return accountApi.smsCode(p.scene, p.phone, p.captchaId, p.captchaCode)
        .then(() => {
            dispatch({type: SMS_CODE_SUCCESS});
        }).catch((err) => {
            dispatch({type: SMS_CODE_FAILURE, error: true, payload: err});
        });
};

export const apiSmsLogin = (p: smsLoginParams): Dispatchable => (dispatch) => {
    return accountApi.smsLogin(p.phone, p.smsCode)
        .then((data) => {
            dispatch({type: SMS_LOGIN_SUCCESS, payload: data});
        }).catch((err) => {
            dispatch({type: SMS_LOGIN_FAILURE, error: true, payload: err});
        });
};

export const apiLogin = (p: loginParams): Dispatchable => (dispatch) => {
    return accountApi.login(p.name, p.password)
        .then((data) => {
            dispatch({type: LOGIN_SUCCESS, payload: data});
        }).catch((err) => {
            dispatch({type: LOGIN_FAILURE, error: true, payload: err});
        });
};

function jwt(state: string = '', action: StandardAction): string {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return action.payload;
        case SMS_LOGIN_SUCCESS:
            return action.payload;
        default:
            return state;
    }
}

const initErrorMessage = {text: '', timestamp: new Date()};
const errorMessage = (state: TextTimestamp= initErrorMessage, action: StandardAction): TextTimestamp => {
    switch (action.type) {
        case SMS_CODE_FAILURE:
        case LOGIN_FAILURE:
        case SMS_LOGIN_FAILURE:
            return {text: action.payload.message, timestamp: new Date()};
        default:
            return state;
    }
};

const initSmsCodeSentMessage = {text: '', timestamp: new Date()};
const smsCodeSentMessage
    = (state: TextTimestamp= initSmsCodeSentMessage, action: StandardAction): TextTimestamp => {
    switch (action.type) {
        case SMS_CODE_SUCCESS:
            return {text: '验证码已发送', timestamp: new Date()};
        default:
            return state;
    }
};

export const rootReducer = combineReducers<RootState>({
    jwt,
    errorMessage,
    smsCodeSentMessage
});