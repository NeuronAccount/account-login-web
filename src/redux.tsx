import { combineReducers } from "redux";
import { StandardAction } from "./_common/action";
import { TextTimestamp } from "./_common/TimedText";
import {sendLoginSmsCodeParams, smsLoginParams, UserToken} from "./api/account/gen";
import {
    ACTION_SEND_LOGIN_SMS_CODE,
    ACTION_SEND_LOGIN_SMS_CODE_FAILURE, ACTION_SEND_LOGIN_SMS_CODE_SUCCESS, ACTION_SMS_LOGIN,
    ACTION_SMS_LOGIN_FAILURE,
    ACTION_SMS_LOGIN_SUCCESS
} from "./sagas";

export interface RootState {
    userToken: UserToken;
    errorMessage: TextTimestamp;
    smsCodeSentMessage: TextTimestamp;
}

export const sendLoginSmsCode=(p:sendLoginSmsCodeParams)=> {
    return ({
        type: ACTION_SEND_LOGIN_SMS_CODE,
        payload: p
    })
};

export const smsLogin=(p:smsLoginParams)=> {
    return ({
        type: ACTION_SMS_LOGIN,
        payload: p
    })
};

const initUserToken: UserToken = {accessToken: "", refreshToken: ""};
const userTokenReducer = (state: UserToken = initUserToken, action: StandardAction<UserToken>): UserToken => {
    switch (action.type) {
        case ACTION_SMS_LOGIN_SUCCESS:
            return action.payload;
        default:
            return state;
    }
};

const initErrorMessage = {text: "", timestamp: new Date()};
const errorMessageReducer = (state: TextTimestamp= initErrorMessage, action: StandardAction<TextTimestamp>)
    : TextTimestamp => {
    switch (action.type) {
        case ACTION_SEND_LOGIN_SMS_CODE_FAILURE:
        case ACTION_SMS_LOGIN_FAILURE:
            return {text: action.payload.message, timestamp: new Date()};
        default:
            return state;
    }
};

const initSmsCodeSentMessage = {text: "", timestamp: new Date()};
const smsCodeSentMessageReducer
    = (state: TextTimestamp= initSmsCodeSentMessage, action: StandardAction<TextTimestamp>): TextTimestamp => {
    switch (action.type) {
        case ACTION_SEND_LOGIN_SMS_CODE_SUCCESS:
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
