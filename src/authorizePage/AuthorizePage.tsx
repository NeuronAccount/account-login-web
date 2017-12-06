import * as React from 'react';
import Tabs, { Tab } from 'material-ui/Tabs';
import Button from 'material-ui/Button';
import {
    AccountLoginParams,
    apiAccountLogin, ApiError, apiSmsCode, apiSmsLogin, apiSmsSignup, RootState, SmsLoginParams,
    SmsSignupParams
} from '../redux';
import { connect } from 'react-redux';
import { TextField } from 'material-ui';
import { AnyAction } from 'redux';

interface Props {
    jwt: string;

    apiSmsCode: (params: { scene: string, phone: string, captchaId?: string, captchaCode?: string },
                 onSuccess: () => void,
                 onError: (err: ApiError) => void) => (dispatch: (action: AnyAction) => void) => void;
    apiSmsSignup: (params: SmsSignupParams,
                   onSuccess: (jwt: string) => void,
                   onError: (err: ApiError) => void) => (dispatch: (action: AnyAction) => void) => void;
    apiSmsLogin: (params: SmsLoginParams,
                  onSuccess: (jwt: string) => void,
                  onError: (err: ApiError) => void) => (dispatch: (action: AnyAction) => void) => void;
    apiAccountLogin: (params: AccountLoginParams,
                      onSuccess: (jwt: string) => void,
                      onError: (err: ApiError) => void) => (dispatch: (action: AnyAction) => void) => void;
}

interface State {
    queryParams: Map<string, string>;
    inputError: string;
    inputErrorTimer: number;
    inputErrorNotifyStartTime: Date;
    isSignupView: boolean;
    loginTabIndex: number;
    loginName: string;
    loginPassword: string;
    loginPhone: string;
    loginSmsCode: string;
    signupPhone: string;
    signupSmsCode: string;
    signupPassword: string;
}

class AuthorizePage extends React.Component<Props, State> {
    componentWillMount() {
        let queryParamsMap = new Map<string, string>();
        if (window.location.search.startsWith('?')) {
            window.location.search.substring(1).split('&').forEach((pair) => {
                const tokens = pair.split('=');
                if (tokens.length > 1) {
                    queryParamsMap.set(tokens[0], tokens[1]);
                } else {
                    queryParamsMap.set(tokens[0], '');
                }
            });
        }

        this.setState({
            queryParams: queryParamsMap,
            inputError: '',
            isSignupView: false,
            loginTabIndex: 0,
            loginName: '',
            loginPassword: '',
            loginPhone: '',
            loginSmsCode: '',
            signupPhone: '',
            signupSmsCode: '',
            signupPassword: ''
        });

        this.onLoginSuccess = this.onLoginSuccess.bind(this);
        this.onApiError = this.onApiError.bind(this);
    }

    onLoginSuccess(jwt: string) {
        console.log('onLoginSuccess', jwt);

        try {
            window.parent.postMessage(
                {
                    type: 'onLoginSuccess',
                    payload: jwt
                },
                'http://localhost:3000');
        } catch (ex) {
            console.log(ex);
        }
    }

    onApiError(err: ApiError) {
        this.onLoginInputError(err.message);
    }

    onLoginInputError(message: string) {
        if (this.state.inputErrorTimer != null) {
            clearInterval(this.state.inputErrorTimer);
        }

        this.setState({inputError: message, inputErrorNotifyStartTime: new Date()});

        if (message == null || message === '') {
            return;
        }

        let t: number = setInterval(() => {
            if (new Date().getTime() - this.state.inputErrorNotifyStartTime.getTime() > 3000) {
                this.setState({inputError: ''});
                clearInterval(t);
            }
        },                          200);

        this.setState({inputErrorTimer: t});
    }

    enterSignup(signup: boolean) {
        this.setState({isSignupView: signup});
        this.onLoginInputError('');
    }

    renderSmsSignup() {
        return (
            <div>
                <TextField
                    margin="normal"
                    fullWidth={true}
                    label={'手机号'}
                    value={this.state.signupPhone}
                    onChange={(e) => {
                        this.setState({signupPhone: e.target.value});
                    }}
                />
                <TextField
                    margin="normal"
                    fullWidth={true}
                    type={'password'}
                    label={'密码'}
                    value={this.state.signupPassword}
                    onChange={(e) => {
                        this.setState({signupPassword: e.target.value});
                    }}
                />
                <div>
                    <TextField
                        margin="normal"
                        style={{width: '100px', float: 'left'}}
                        label={'验证码'}
                        value={this.state.signupSmsCode}
                        onChange={(e) => {
                            this.setState({signupSmsCode: e.target.value});
                        }}
                    />
                    <Button
                        style={{float: 'right', marginTop: '30px', backgroundColor: '#86ce2f', color: '#FFF'}}
                        onClick={() => {
                            if (this.state.signupPhone == null || this.state.signupPhone === '') {
                                return this.onLoginInputError('！请输入手机号');
                            }

                            this.props.apiSmsCode({scene: 'SMS_SIGNUP', phone: this.state.signupPhone},
                                                  () => {
                                    console.log('success');
                                },
                                                  (err) => {
                                    this.onLoginInputError(err.message);
                                });
                        }}
                    >
                        发送短信验证码
                    </Button>
                </div>
                <Button
                    style={{backgroundColor: '#86ce2f', color: '#FFF', width: '100%', marginTop: '20px'}}
                    onClick={() => {
                        if (this.state.signupPhone == null || this.state.signupPhone === '') {
                            return this.onLoginInputError('！请输入手机号');
                        }

                        if (this.state.signupPassword == null || this.state.signupPassword === '') {
                            return this.onLoginInputError('！请输入密码');
                        }

                        if (this.state.signupSmsCode == null || this.state.signupSmsCode === '') {
                            return this.onLoginInputError('！请输入验证码');
                        }

                        this.props.apiSmsSignup({
                                phone: this.state.signupPhone,
                                smsCode: this.state.signupSmsCode,
                                password: this.state.signupPassword
                            },
                                                this.onLoginSuccess,
                                                this.onApiError);
                    }}
                >
                    <label style={{fontSize: 'large'}}>注册并授权登录</label>
                </Button>
            </div>
        );
    }

    renderSignup() {
        return (
            <div
                style={{
                    width: '300px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: '20px',
                }}
            >
                <div style={{marginLeft: '20px', marginRight: '20px', marginBottom: '20px'}}>
                    <div style={{marginTop: '5px', height: '10px'}}>
                        <label style={{fontSize: '50%', color: 'red'}}>{this.state.inputError}</label>
                    </div>
                    {this.renderSmsSignup()}
                </div>
                <div style={{marginTop: '30px', fontSize: 'small'}}>
                    <div style={{float: 'right'}}>
                        <label
                            onClick={() => {
                                this.enterSignup(false);
                            }}
                        >
                            返回登录
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    renderAccountLogin() {
        return (
            <div>
                <TextField
                    margin="normal"
                    fullWidth={true}
                    label={'手机号'}
                    value={this.state.loginName}
                    onChange={(e) => {
                        this.setState({loginName: e.target.value});
                    }}
                />
                <TextField
                    margin="normal"
                    fullWidth={true}
                    type={'password'}
                    label={'密码'}
                    value={this.state.loginPassword}
                    onChange={(e) => {
                        this.setState({loginPassword: e.target.value});
                    }}
                />
                <Button
                    style={{backgroundColor: '#86ce2f', color: '#FFF', width: '100%', marginTop: '20px'}}
                    onClick={() => {
                        if (this.state.loginName == null || this.state.loginName === '') {
                            return this.onLoginInputError('！请输入手机号');
                        }

                        if (this.state.loginPassword == null || this.state.loginPassword === '') {
                            return this.onLoginInputError('！请输入密码');
                        }

                        this.props.apiAccountLogin({
                                name: this.state.loginName,
                                password: this.state.loginPassword
                            },
                                                   this.onLoginSuccess,
                                                   this.onApiError
                        );
                    }}
                >
                    <label style={{fontSize: 'large'}}>授权并登录</label>
                </Button>
            </div>
        );
    }

    renderSmsLogin() {
        return (
            <div>
                <TextField
                    margin="normal"
                    fullWidth={true}
                    label={'手机号'}
                    value={this.state.loginPhone}
                    onChange={(e) => {
                        this.setState({loginPhone: e.target.value});
                    }}
                />
                <div>
                    <TextField
                        margin="normal"
                        style={{width: '100px'}}
                        label={'验证码'}
                        value={this.state.loginSmsCode}
                        onChange={(e) => {
                            this.setState({loginSmsCode: e.target.value});
                        }}
                    />
                    <Button
                        style={{float: 'right', marginTop: '30px', backgroundColor: '#86ce2f', color: '#FFF'}}
                        onClick={() => {
                            if (this.state.loginPhone == null || this.state.loginPhone === '') {
                                return this.onLoginInputError('！请输入手机号');
                            }

                            this.props.apiSmsCode({scene: 'SMS_LOGIN', phone: this.state.loginPhone}, () => {
                                console.log('success');
                            },                    this.onApiError);
                        }}
                    >
                        发送短信验证码
                    </Button>
                </div>
                <Button
                    style={{backgroundColor: '#86ce2f', color: '#FFF', width: '100%', marginTop: '20px'}}
                    onClick={() => {
                        if (this.state.loginPhone == null || this.state.loginPhone === '') {
                            return this.onLoginInputError('！请输入手机号');
                        }

                        if (this.state.loginSmsCode == null || this.state.loginSmsCode === '') {
                            return this.onLoginInputError('！请输入验证码');
                        }

                        this.props.apiSmsLogin({
                                phone: this.state.loginPhone,
                                smsCode: this.state.loginSmsCode
                            },
                                               this.onLoginSuccess,
                                               this.onApiError
                        );
                    }}
                >
                    <label style={{fontSize: 'large'}}>授权并登录</label>
                </Button>
            </div>
        );
    }

    render() {
        return (
            <div
                style={{
                    width: '300px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: '20px',
                }}
            >
                <Tabs
                    value={this.state.loginTabIndex}
                    fullWidth={true}
                    onChange={(event: {}, v: number) => {
                        this.setState({loginTabIndex: v});
                        this.onLoginInputError('');
                    }}
                >
                    <Tab label="帐号密码登录"/>
                    <Tab label="短信验证码登录"/>
                </Tabs>
                <div style={{marginLeft: '20px', marginRight: '20px', marginBottom: '20px'}}>
                    <div style={{marginTop: '5px', height: '10px'}}>
                        <label style={{fontSize: '50%', color: 'red'}}>{this.state.inputError}</label>
                    </div>
                    {this.state.loginTabIndex === 0 && this.renderAccountLogin()}
                    {this.state.loginTabIndex === 1 && this.renderSmsLogin()}
                </div>
                <div style={{fontSize: 'small', height: '20px'}}>
                    <div style={{float: 'right'}}>
                        <a
                            href="http://qq.com"
                            target="_blank"
                            style={{textDecoration: 'none'}}
                        >
                            忘了密码？
                        </a>
                        <label>&nbsp;&nbsp;|&nbsp;&nbsp;</label>
                        <a
                            href="http://qq.com"
                            target="_blank"
                            style={{textDecoration: 'none'}}
                        >
                            注册新帐号
                        </a>
                        <label>&nbsp;&nbsp;|&nbsp;&nbsp;</label>
                        <a
                            href="http://qq.com"
                            target="_blank"
                            style={{textDecoration: 'none'}}
                        >
                            意见反馈
                        </a>
                    </div>
                </div>
                <div style={{marginTop: '30px', marginLeft: 'auto', marginRight: 'auto', width: '192px'}}>
                    <label
                        style={{
                            width: '64px',
                            display: 'block',
                            textAlign: 'center',
                            float: 'left',
                        }}
                    >
                        QQ
                    </label>
                    <label
                        style={{
                            width: '64px',
                            display: 'block',
                            textAlign: 'center',
                            float: 'left',
                        }}
                    >
                        微信
                    </label>
                    <label
                        style={{
                            width: '64px',
                            display: 'block',
                            textAlign: 'center',
                            float: 'left',
                        }}
                    >
                        微博
                    </label>
                </div>
            </div>
        );
    }
}

function selectProps(state: RootState) {
    return {
        jwt: state.jwt
    };
}

export default  connect(selectProps, {
    apiSmsCode,
    apiSmsSignup,
    apiSmsLogin,
    apiAccountLogin,
})(AuthorizePage);