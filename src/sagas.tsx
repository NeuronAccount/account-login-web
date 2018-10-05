import {all, call, put, takeLatest} from "redux-saga/effects";
import {StandardAction} from "./_common/action";
import {DefaultApiFactory, sendLoginSmsCodeParams, smsLoginParams} from "./api/account/gen";
import {env} from "./env";
import {REDUX_STORE} from "./index";

const accountApi = DefaultApiFactory(
    {apiKey: () => REDUX_STORE.getState().userToken.accessToken},
    fetch, env.host + "/api/v1/accounts");

export const ACTION_SEND_LOGIN_SMS_CODE = "ACTION_SEND_LOGIN_SMS_CODE";
export const ACTION_SEND_LOGIN_SMS_CODE_REQUEST = "ACTION_SEND_LOGIN_SMS_CODE_REQUEST";
export const ACTION_SEND_LOGIN_SMS_CODE_SUCCESS = "ACTION_SEND_LOGIN_SMS_CODE_SUCCESS";
export const ACTION_SEND_LOGIN_SMS_CODE_FAILURE = "ACTION_SEND_LOGIN_SMS_CODE_FAILURE";

function* watchSendLoginSmsCode(action: StandardAction<sendLoginSmsCodeParams>) {
    yield put({type: ACTION_SEND_LOGIN_SMS_CODE_REQUEST});
    const {err} = yield call(accountApi.sendLoginSmsCode, action.payload);
    if (!err) {
        yield put({type: ACTION_SEND_LOGIN_SMS_CODE_SUCCESS});
    } else {
        yield put({type: ACTION_SEND_LOGIN_SMS_CODE_FAILURE, error: true, payload: err});
    }
}

export const ACTION_SMS_LOGIN = "ACTION_SMS_LOGIN";
export const ACTION_SMS_LOGIN_REQUEST = "ACTION_SMS_LOGIN_REQUEST";
export const ACTION_SMS_LOGIN_SUCCESS = "ACTION_SMS_LOGIN_SUCCESS";
export const ACTION_SMS_LOGIN_FAILURE = "ACTION_SMS_LOGIN_FAILURE";

function * watchSmsLogin(action: StandardAction<smsLoginParams>) {
    yield put({type: ACTION_SMS_LOGIN_REQUEST});
    const {data, err} = yield call<smsLoginParams>(accountApi.smsLogin, action.payload);
    if (!err) {
        yield put({type: ACTION_SMS_LOGIN_SUCCESS, payload: data});
    } else {
        yield put({type: ACTION_SMS_LOGIN_FAILURE, error: true, payload: err});
    }
}

export default function* rootSaga() {
    yield all([
        takeLatest<StandardAction<sendLoginSmsCodeParams>>(ACTION_SEND_LOGIN_SMS_CODE, watchSendLoginSmsCode),
        takeLatest<StandardAction<smsLoginParams>>(ACTION_SMS_LOGIN, watchSmsLogin),
    ]);
}
