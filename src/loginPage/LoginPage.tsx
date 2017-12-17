import * as React from 'react';
import Tabs, { Tab } from 'material-ui/Tabs';
import Button from 'material-ui/Button';
import { apiLogin, apiSmsCode, apiSmsLogin, RootState,
} from '../redux';
import { connect } from 'react-redux';
import { TextField } from 'material-ui';
import { LoginParams, SmsCodeParams, SmsLoginParams } from '../api/account-private/gen/api';
import { Dispatchable } from '../_common/action';
import { TextTimestamp, default as TimedText } from '../_common/TimedText';
import { parseQueryString } from '../_common/common';

interface Props {
    jwt: string;
    errorMessage: TextTimestamp;
    smsCodeSentMessage: TextTimestamp;

    apiSmsCode: (params: SmsCodeParams) => Dispatchable;
    apiSmsLogin: (params: SmsLoginParams) => Dispatchable;
    apiLogin: (params: LoginParams) => Dispatchable;
}

interface State {
    queryParams: Map<string, string>;
    queryFromOrigin: string;
    errorMessage: TextTimestamp;
    loginTabIndex: number;
    loginName: string;
    loginPassword: string;
    loginPhone: string;
    loginSmsCode: string;
}

class LoginPage extends React.Component<Props, State> {
    componentWillMount() {
        let queryParamsMap = parseQueryString(window.location.search);

        let queryFromOrigin = queryParamsMap.get('fromOrigin');

        this.setState({
            queryParams: queryParamsMap,
            queryFromOrigin: queryFromOrigin == null ? '' : queryFromOrigin,
            errorMessage: {text: '', timestamp: new Date()},
            loginTabIndex: 0,
            loginName: '',
            loginPassword: '',
            loginPhone: '',
            loginSmsCode: '',
        });
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.errorMessage.text !== this.props.errorMessage.text
            || nextProps.errorMessage.timestamp !== this.props.errorMessage.timestamp) {
            this.setState({errorMessage: nextProps.errorMessage});
        }
    }

    onError(message: string) {
        this.setState({errorMessage: {text: message, timestamp: new Date()}});
    }

    renderLogin() {
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
                        this.onError('');
                    }}
                >
                    <Tab label="帐号密码登录"/>
                    <Tab label="短信验证码登录"/>
                </Tabs>
                <div style={{marginBottom: '20px'}}>
                    <div style={{marginTop: '5px', height: '10px'}}>
                        <TimedText
                            text={this.state.errorMessage}
                            intervalMillSec={3000}
                            style={{fontSize: '50%', color: 'red'}}
                        />
                    </div>
                    {this.state.loginTabIndex === 0 && this.renderAccountLogin()}
                    {this.state.loginTabIndex === 1 && this.renderSmsLogin()}
                    <div style={{marginTop: '5px', height: '10px'}}>
                        {
                            this.props.jwt !== '' &&

                            <label
                                style={{
                                    float: 'right',
                                    fontSize: 'x-small',
                                    color: '#888',
                                }}
                            >
                                登录成功
                            </label>
                        }
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
                    style={{backgroundColor: '#86ce2f', color: '#FFF', width: '100%', marginTop: '10px'}}
                    onClick={() => {
                        if (this.state.loginName == null || this.state.loginName === '') {
                            return this.onError('！请输入手机号');
                        }

                        if (this.state.loginPassword == null || this.state.loginPassword === '') {
                            return this.onError('！请输入密码');
                        }

                        this.props.apiLogin(
                            {
                                name: this.state.loginName,
                                password: this.state.loginPassword
                            }
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
                        style={{width: '100px', float: 'left'}}
                        label={'验证码'}
                        value={this.state.loginSmsCode}
                        onChange={(e) => {
                            this.setState({loginSmsCode: e.target.value});
                        }}
                    />
                    <div style={{height: '20px'}}>
                        {
                            this.props.smsCodeSentMessage &&
                            <TimedText
                                text={this.props.smsCodeSentMessage}
                                intervalMillSec={3000}
                                style={{fontSize: 'x-small', color: '#BBB', float: 'right'}}
                            />
                        }
                    </div>
                    <Button
                        style={{float: 'right', marginTop: '8px', backgroundColor: '#86ce2f', color: '#FFF'}}
                        onClick={() => {
                            if (this.state.loginPhone == null || this.state.loginPhone === '') {
                                return this.onError('！请输入手机号');
                            }

                            this.props.apiSmsCode(
                                {
                                    scene: 'SMS_LOGIN',
                                    phone: this.state.loginPhone
                                });
                        }}
                    >
                        发送短信验证码
                    </Button>
                </div>
                <Button
                    style={{backgroundColor: '#86ce2f', color: '#FFF', width: '100%', marginTop: '10px'}}
                    onClick={() => {
                        if (this.state.loginPhone == null || this.state.loginPhone === '') {
                            return this.onError('！请输入手机号');
                        }

                        if (this.state.loginSmsCode == null || this.state.loginSmsCode === '') {
                            return this.onError('！请输入验证码');
                        }

                        this.props.apiSmsLogin(
                            {
                                phone: this.state.loginPhone,
                                smsCode: this.state.loginSmsCode
                            }
                        );
                    }}
                >
                    <label style={{fontSize: 'large'}}>授权并登录</label>
                </Button>
            </div>
        );
    }

    renderLinks() {
        return (
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
                        href="http://localhost:3003/"
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
                        安全中心
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
        );
    }

    renderOauthLogin() {
        return (
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
        );
    }

    render() {
        if (this.props.jwt !== '') {
            if (this.state.queryFromOrigin != null && this.state.queryFromOrigin !== '') {
                window.parent.postMessage(
                    {
                        type: 'onLoginSuccess',
                        payload: this.props.jwt
                    },
                    decodeURIComponent(this.state.queryFromOrigin)
                );
            }
        }

        return (
            <div>
                {this.renderLogin()}
                {this.renderLinks()}
                {this.renderOauthLogin()}
            </div>
        );
    }
}

function selectProps(state: RootState) {
    return {
        jwt: state.jwt,
        errorMessage: state.errorMessage,
        smsCodeSentMessage: state.smsCodeSentMessage,
    };
}

export default  connect(selectProps, {
    apiSmsCode,
    apiSmsLogin,
    apiLogin,
})(LoginPage);