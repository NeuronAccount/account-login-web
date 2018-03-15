import { Store } from 'react-redux';
import { combineReducers } from 'redux';
import { Dispatchable, StandardAction } from '../action';
import { onApiError, onErrorMessage } from '../redux_error';
import {DefaultApiFactory as UserPrivateApi, Token } from './user-private/gen';

const userPrivateApiHost = 'http://' + '127.0.0.1' + ':8086/api-private/v1/users';
const userPrivateApi = UserPrivateApi(undefined, fetch, userPrivateApiHost);

const ACTION_LOGIN_SUCCESS = 'ACTION_LOGIN_SUCCESS';
const ACTION_USER_REFRESH_TOKEN = 'ACTION_USER_REFRESH_TOKEN';
const ACTION_USER_LOGOUT_SUCCESS = 'ACTION_USER_LOGOUT_SUCCESS';
const ACTION_REQUIRE_LOGIN = 'ACTION_REQUIRE_LOGIN';

export interface User {
    userID: string;
    accessToken: string;
    refreshToken: string;
}

export const userReducer = combineReducers<User>({
    userID: (state: string= '', action: StandardAction): string => {
        switch (action.type) {
            case ACTION_LOGIN_SUCCESS:
                return action.payload.userID;
            case ACTION_REQUIRE_LOGIN:
                return '';
            case ACTION_USER_LOGOUT_SUCCESS:
                return '';
            default:
                return state;
        }
    },
    accessToken: (state: string = '', action: StandardAction): string => {
        switch (action.type) {
            case ACTION_LOGIN_SUCCESS:
                return action.payload.accessToken;
            case ACTION_USER_REFRESH_TOKEN:
                return action.payload.accessToken;
            case ACTION_REQUIRE_LOGIN:
                return '';
            case ACTION_USER_LOGOUT_SUCCESS:
                return '';
            default:
                return state;
        }
    },
    refreshToken: (state: string = '', action: StandardAction): string => {
        switch (action.type) {
            case ACTION_LOGIN_SUCCESS:
                return action.payload.refreshToken;
            case ACTION_USER_REFRESH_TOKEN:
                return action.payload.refreshToken;
            case ACTION_REQUIRE_LOGIN:
                return '';
            case ACTION_USER_LOGOUT_SUCCESS:
                return '';
            default:
                return state;
        }
    }
});

export const onLoginCallbackDispatch = (user: User): Dispatchable => (dispatch) => {
    dispatch({type: ACTION_LOGIN_SUCCESS, payload: user});
};

export const apiUserLogout = (store: Store<{user: User}>): Dispatchable => (dispatch) => {
    const {accessToken, refreshToken} = store.getState().user;
    return userPrivateApi.logout(accessToken, refreshToken).then(() => {
        dispatch(onErrorMessage('您已退出登录'));
        dispatch({type: ACTION_USER_LOGOUT_SUCCESS});
    }).catch((err) => {
        dispatch(onApiError(err, userPrivateApiHost + '/logout'));
    });
};

const isUnauthorizedError = (err: any): boolean => {
    const status = err && err.status;
    return status === 401;
};

const apiRefreshUserToken = (store: Store<{user: User}>, refreshToken: string): Promise<void> => {
    return userPrivateApi.refreshToken(refreshToken).then((data: Token) => {
        store.dispatch({type: ACTION_USER_REFRESH_TOKEN, payload: data});
    }).catch((err) => {
        store.dispatch(onApiError(err, userPrivateApiHost + 'refreshToken'));
    });
};

export const apiCall = (store: Store<{user: User}>, f: () => Promise<any>): void => {
    f().then(() => {
        console.log('progress end'); // todo 防止同时刷新
    }).catch((err) => {
        if (!isUnauthorizedError(err)) {
            store.dispatch(onApiError(err, ''));
            return null;
        }

        const {refreshToken} = store.getState().user;
        if (!refreshToken) {
            store.dispatch({type: ACTION_REQUIRE_LOGIN});
            return null;
        }

        return apiRefreshUserToken(store, refreshToken).then(() => {
            return f().catch((errAgain: any) => {
                if (!isUnauthorizedError(errAgain)) {
                    store.dispatch(onApiError(errAgain, ''));
                    return;
                }

                store.dispatch({type: ACTION_REQUIRE_LOGIN});
            });
        });
    });
};