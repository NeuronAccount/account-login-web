export interface Env {
    host: string;
    publicUrl: string;
    webPath: string;
}

export const env: Env = {
    host: process.env.REACT_APP_WEB_HOST ? process.env.REACT_APP_WEB_HOST : '',
    publicUrl: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '',
    webPath: process.env.REACT_APP_WEB_PATH ? process.env.REACT_APP_WEB_PATH : ''
};
