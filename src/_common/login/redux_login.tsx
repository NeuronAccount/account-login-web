import { combineReducers } from "redux";
import {put} from "redux-saga/effects";
import { env } from "../../env";
import { StandardAction } from "../action";
import { onApiError, onErrorMessage } from "../redux_error";
import {DefaultApiFactory as UserPrivateApi, Token } from "./user-private/gen";

const userPrivateApiHost = env.host + "/api-private/v1/users";
const userPrivateApi = UserPrivateApi(undefined, fetch, userPrivateApiHost);

export const ACTION_LOGIN_SUCCESS = "ACTION_LOGIN_SUCCESS";
export const ACTION_USER_REFRESH_TOKEN = "ACTION_USER_REFRESH_TOKEN";
export const ACTION_USER_LOGOUT_SUCCESS = "ACTION_USER_LOGOUT_SUCCESS";
export const ACTION_REQUIRE_LOGIN = "ACTION_REQUIRE_LOGIN";

export interface User {
    userID: string;
    accessToken: string;
    refreshToken: string;
}

export const userReducer = combineReducers<User>({
    userID: (state: string= "", action: StandardAction<any>): string => {
        switch (action.type) {
            case ACTION_LOGIN_SUCCESS:
                return action.payload.userID;
            case ACTION_REQUIRE_LOGIN:
                return "";
            case ACTION_USER_LOGOUT_SUCCESS:
                return "";
            default:
                return state;
        }
    },
    accessToken: (state: string = "", action: StandardAction<any>): string => {
        switch (action.type) {
            case ACTION_LOGIN_SUCCESS:
                return action.payload.accessToken;
            case ACTION_USER_REFRESH_TOKEN:
                return action.payload.accessToken;
            case ACTION_REQUIRE_LOGIN:
                return "";
            case ACTION_USER_LOGOUT_SUCCESS:
                return "";
            default:
                return state;
        }
    },
    refreshToken: (state: string = "", action: StandardAction<any>): string => {
        switch (action.type) {
            case ACTION_LOGIN_SUCCESS:
                return action.payload.refreshToken;
            case ACTION_USER_REFRESH_TOKEN:
                return action.payload.refreshToken;
            case ACTION_REQUIRE_LOGIN:
                return "";
            case ACTION_USER_LOGOUT_SUCCESS:
                return "";
            default:
                return state;
        }
    },
});

export const apiUserLogout = (user: User) => {
    const {accessToken, refreshToken} = user;
    return userPrivateApi.logout(accessToken, refreshToken).then(() => {
        onErrorMessage("您已退出登录");
        put({type: ACTION_USER_LOGOUT_SUCCESS});
    }).catch((err) => {
        onApiError(err, userPrivateApiHost + "/logout");
    });
};

const isUnauthorizedError = (err: any): boolean => {
    const status = err && err.status;
    return status === 401;
};

const apiRefreshUserToken = (refreshToken: string): Promise<void> => {
    return userPrivateApi.refreshToken(refreshToken).then((data: Token) => {
        put({type: ACTION_USER_REFRESH_TOKEN, payload: data});
    }).catch((err) => {
        onApiError(err, userPrivateApiHost + "refreshToken");
    });
};

export const apiCall = (user: User, f: () => Promise<any>): void => {
    f().then(() => {
        console.log("progress end"); // todo 防止同时刷新
    }).catch((err) => {
        if (!isUnauthorizedError(err)) {
            onApiError(err, "");
            return null;
        }

        const {refreshToken} = user;
        if (!refreshToken) {
            put({type: ACTION_REQUIRE_LOGIN});
            return null;
        }

        return apiRefreshUserToken(refreshToken).then(() => {
            return f().catch((errAgain: any) => {
                if (!isUnauthorizedError(errAgain)) {
                    onApiError(errAgain, "");
                    return;
                }

                put({type: ACTION_REQUIRE_LOGIN});
            });
        });
    });
};
