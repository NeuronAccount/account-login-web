import { combineReducers } from "redux";
import { Dispatchable, StandardAction } from "./_common/action";
import { TextTimestamp } from "./_common/TimedText";
import {
    DefaultApiFactory, sendLoginSmsCodeParams, smsLoginParams, UserToken,
} from "./api/account/gen";
import { env } from "./env";
import { REDUX_STORE } from "./index";

const SEND_LOGIN_SMS_CODE_FAILURE = "SEND_LOGIN_SMS_CODE_FAILURE";
const SEND_LOGIN_SMS_CODE_SUCCESS = "SEND_LOGIN_SMS_CODE_SUCCESS";
const SMS_LOGIN_FAILURE = "SMS_LOGIN_FAILURE";
const SMS_LOGIN_SUCCESS = "SMS_LOGIN_SUCCESS";

const accountApi = DefaultApiFactory(
    {apiKey: () => REDUX_STORE.getState().userToken.accessToken},
    fetch, env.host + "/api/v1/accounts");

export interface RootState {
    userToken: UserToken;
    errorMessage: TextTimestamp;
    smsCodeSentMessage: TextTimestamp;
}

export const apiSendLoginSmsCode = (p: sendLoginSmsCodeParams): Dispatchable => (dispatch) => {
    return accountApi.sendLoginSmsCode(p.phone, p.captchaId, p.captchaCode)
        .then(() => {
            dispatch({type: SEND_LOGIN_SMS_CODE_SUCCESS});
        }).catch((err) => {
            dispatch({type: SEND_LOGIN_SMS_CODE_FAILURE, error: true, payload: err});
        });
};

export const apiSmsLogin = (p: smsLoginParams): Dispatchable => (dispatch) => {
    return accountApi.smsLogin(p.phone, p.smsCode)
        .then((userToken: UserToken) => {
            dispatch({type: SMS_LOGIN_SUCCESS, payload: userToken});
        }).catch((err) => {
            dispatch({type: SMS_LOGIN_FAILURE, error: true, payload: err});
        });
};

const initUserToken: UserToken = {accessToken: "", refreshToken: ""};
const userTokenReducer = (state: UserToken = initUserToken, action: StandardAction): UserToken => {
    switch (action.type) {
        case SMS_LOGIN_SUCCESS:
            return action.payload;
        default:
            return state;
    }
};

const initErrorMessage = {text: "", timestamp: new Date()};
const errorMessageReducer = (state: TextTimestamp= initErrorMessage, action: StandardAction): TextTimestamp => {
    switch (action.type) {
        case SEND_LOGIN_SMS_CODE_FAILURE:
        case SMS_LOGIN_FAILURE:
            return {text: action.payload.message, timestamp: new Date()};
        default:
            return state;
    }
};

const initSmsCodeSentMessage = {text: "", timestamp: new Date()};
const smsCodeSentMessageReducer
    = (state: TextTimestamp= initSmsCodeSentMessage, action: StandardAction): TextTimestamp => {
    switch (action.type) {
        case SEND_LOGIN_SMS_CODE_SUCCESS:
            return {text: "验证码已发送", timestamp: new Date()};
        default:
            return state;
    }
};

export const rootReducer = combineReducers<RootState>({
    errorMessage: errorMessageReducer,
    smsCodeSentMessage: smsCodeSentMessageReducer,
    userToken: userTokenReducer,
});
