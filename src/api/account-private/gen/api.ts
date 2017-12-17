import * as url from "url";

import * as isomorphicFetch from "isomorphic-fetch";
import * as assign from "core-js/library/fn/object/assign";

interface Dictionary<T> { [index: string]: T; }
export interface FetchAPI { (url: string, init?: any): Promise<any>; }

const BASE_PATH = "http://localhost/api-private/v1/accounts".replace(/\/+$/, "");

export interface FetchArgs {
    url: string;
    options: any;
}

export class BaseAPI {
    basePath: string;
    fetch: FetchAPI;

    constructor(fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) {
        this.basePath = basePath;
        this.fetch = fetch;
    }
}

export interface InlineResponseDefault {
    "status"?: string;
    /**
     * Error code
     */
    "code"?: string;
    /**
     * Error message
     */
    "message"?: string;
    /**
     * Errors
     */
    "errors"?: Array<InlineResponseDefaultErrors>;
}

export interface InlineResponseDefaultErrors {
    /**
     * field name
     */
    "field"?: string;
    /**
     * error code
     */
    "code"?: string;
    /**
     * error message
     */
    "message"?: string;
}



export const DefaultApiFetchParamCreator = {
    login(params: {  "name": string; "password": string; }, options?: any): FetchArgs {
        // verify required parameter "name" is set
        if (params["name"] == null) {
            throw new Error("Missing required parameter name when calling login");
        }
        // verify required parameter "password" is set
        if (params["password"] == null) {
            throw new Error("Missing required parameter password when calling login");
        }
        const baseUrl = `/login`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "name": params["name"],
            "password": params["password"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "POST" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    logout(params: {  "jwt": string; }, options?: any): FetchArgs {
        // verify required parameter "jwt" is set
        if (params["jwt"] == null) {
            throw new Error("Missing required parameter jwt when calling logout");
        }
        const baseUrl = `/logout`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "jwt": params["jwt"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "POST" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    smsCode(params: {  "scene": string; "phone": string; "captchaId"?: string; "captchaCode"?: string; }, options?: any): FetchArgs {
        // verify required parameter "scene" is set
        if (params["scene"] == null) {
            throw new Error("Missing required parameter scene when calling smsCode");
        }
        // verify required parameter "phone" is set
        if (params["phone"] == null) {
            throw new Error("Missing required parameter phone when calling smsCode");
        }
        const baseUrl = `/smsCode`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "scene": params["scene"],
            "phone": params["phone"],
            "captchaId": params["captchaId"],
            "captchaCode": params["captchaCode"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "POST" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    smsLogin(params: {  "phone": string; "smsCode": string; }, options?: any): FetchArgs {
        // verify required parameter "phone" is set
        if (params["phone"] == null) {
            throw new Error("Missing required parameter phone when calling smsLogin");
        }
        // verify required parameter "smsCode" is set
        if (params["smsCode"] == null) {
            throw new Error("Missing required parameter smsCode when calling smsLogin");
        }
        const baseUrl = `/smsLogin`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "phone": params["phone"],
            "smsCode": params["smsCode"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "POST" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    smsSignup(params: {  "phone": string; "smsCode": string; "password": string; }, options?: any): FetchArgs {
        // verify required parameter "phone" is set
        if (params["phone"] == null) {
            throw new Error("Missing required parameter phone when calling smsSignup");
        }
        // verify required parameter "smsCode" is set
        if (params["smsCode"] == null) {
            throw new Error("Missing required parameter smsCode when calling smsSignup");
        }
        // verify required parameter "password" is set
        if (params["password"] == null) {
            throw new Error("Missing required parameter password when calling smsSignup");
        }
        const baseUrl = `/smsSignup`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "phone": params["phone"],
            "smsCode": params["smsCode"],
            "password": params["password"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "POST" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
};


export const DefaultApiFp = {
    login(params: { "name": string; "password": string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<string> {
        const fetchArgs = DefaultApiFetchParamCreator.login(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    return response.json().then((data: {}) => {throw data; });
                }
            });
        };
    },
    logout(params: { "jwt": string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<any> {
        const fetchArgs = DefaultApiFetchParamCreator.logout(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response;
                } else {
                    return response.json().then((data: {}) => {throw data; });
                }
            });
        };
    },
    smsCode(params: { "scene": string; "phone": string; "captchaId"?: string; "captchaCode"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<any> {
        const fetchArgs = DefaultApiFetchParamCreator.smsCode(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response;
                } else {
                    return response.json().then((data: {}) => {throw data; });
                }
            });
        };
    },
    smsLogin(params: { "phone": string; "smsCode": string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<string> {
        const fetchArgs = DefaultApiFetchParamCreator.smsLogin(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    return response.json().then((data: {}) => {throw data; });
                }
            });
        };
    },
    smsSignup(params: { "phone": string; "smsCode": string; "password": string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<string> {
        const fetchArgs = DefaultApiFetchParamCreator.smsSignup(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    return response.json().then((data: {}) => {throw data; });
                }
            });
        };
    },
};

export class DefaultApi extends BaseAPI {
    login(params: {  "name": string; "password": string; }, options?: any) {
        return DefaultApiFp.login(params, options)(this.fetch, this.basePath);
    }
    logout(params: {  "jwt": string; }, options?: any) {
        return DefaultApiFp.logout(params, options)(this.fetch, this.basePath);
    }
    smsCode(params: {  "scene": string; "phone": string; "captchaId"?: string; "captchaCode"?: string; }, options?: any) {
        return DefaultApiFp.smsCode(params, options)(this.fetch, this.basePath);
    }
    smsLogin(params: {  "phone": string; "smsCode": string; }, options?: any) {
        return DefaultApiFp.smsLogin(params, options)(this.fetch, this.basePath);
    }
    smsSignup(params: {  "phone": string; "smsCode": string; "password": string; }, options?: any) {
        return DefaultApiFp.smsSignup(params, options)(this.fetch, this.basePath);
    }
}

export const DefaultApiFactory = function (fetch?: FetchAPI, basePath?: string) {
    return {
        login(params: {  "name": string; "password": string; }, options?: any) {
            return DefaultApiFp.login(params, options)(fetch, basePath);
        },
        logout(params: {  "jwt": string; }, options?: any) {
            return DefaultApiFp.logout(params, options)(fetch, basePath);
        },
        smsCode(params: {  "scene": string; "phone": string; "captchaId"?: string; "captchaCode"?: string; }, options?: any) {
            return DefaultApiFp.smsCode(params, options)(fetch, basePath);
        },
        smsLogin(params: {  "phone": string; "smsCode": string; }, options?: any) {
            return DefaultApiFp.smsLogin(params, options)(fetch, basePath);
        },
        smsSignup(params: {  "phone": string; "smsCode": string; "password": string; }, options?: any) {
            return DefaultApiFp.smsSignup(params, options)(fetch, basePath);
        },
    };
};

export interface LoginParams {
    name: string;
    password: string;
}

export interface LogoutParams {
    jwt: string;
}

export interface SmsCodeParams {
    scene: string;
    phone: string;
    captchaId?: string;
    captchaCode?: string;
}

export interface SmsLoginParams {
    phone: string;
    smsCode: string;
}

export interface SmsSignupParams {
    phone: string;
    smsCode: string;
    password: string;
}


export const login_REQUEST = "login_REQUEST";
export const login_FAILURE = "login_FAILURE";
export const login_SUCCESS = "login_SUCCESS";
export const logout_REQUEST = "logout_REQUEST";
export const logout_FAILURE = "logout_FAILURE";
export const logout_SUCCESS = "logout_SUCCESS";
export const smsCode_REQUEST = "smsCode_REQUEST";
export const smsCode_FAILURE = "smsCode_FAILURE";
export const smsCode_SUCCESS = "smsCode_SUCCESS";
export const smsLogin_REQUEST = "smsLogin_REQUEST";
export const smsLogin_FAILURE = "smsLogin_FAILURE";
export const smsLogin_SUCCESS = "smsLogin_SUCCESS";
export const smsSignup_REQUEST = "smsSignup_REQUEST";
export const smsSignup_FAILURE = "smsSignup_FAILURE";
export const smsSignup_SUCCESS = "smsSignup_SUCCESS";

