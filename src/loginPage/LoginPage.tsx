import { Button, Tab, Tabs , TextField } from 'material-ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatchable, StandardAction } from '../_common/action';
import { checkPhone, parseQueryString } from '../_common/common';
import { countdown } from '../_common/countdown';
import { default as TimedText, TextTimestamp } from '../_common/TimedText';
import { loginParams, smsCodeParams, smsLoginParams } from '../api/account-private/gen';
import { env } from '../env';
import { apiLogin, apiSmsCode, apiSmsLogin, RootState,
} from '../redux';

export const MAX_LOGIN_NAME_LENGTH = 24;
export const MAX_PHONE_LENGTH = 11;
export const MAX_PASSWORD_LENGTH = 20;
export const MAX_SMS_CODE_LENGTH = 6;

interface Props {
    jwt: string;
    errorMessage: TextTimestamp;
    smsCodeSentMessage: TextTimestamp;

    apiSmsCode: (p: smsCodeParams) => Dispatchable;
    apiSmsLogin: (p: smsLoginParams) => Dispatchable;
    apiLogin: (p: loginParams) => Dispatchable;
}

interface State {
    queryParams: Map<string, string>;
    fromOrigin?: string;
    errorMessage: TextTimestamp;
    tabIndex: number;
    loginName: string;
    loginPassword: string;
    loginPhone: string;
    loginSmsCode: string;
    smsCodeCountdown: number;
}

class LoginPage extends React.Component<Props, State> {
    private static renderLinks() {
        return (
            <div style={{fontSize: '13px', height: '20px', marginLeft: '8px'}}>
                <a
                    href="https://www.aliyun.com/"
                    target="_blank"
                    style={{textDecoration: 'none', color: '#008888'}}>
                    忘了密码？
                </a>
                <label>&nbsp;&nbsp;|&nbsp;&nbsp;</label>
                <a
                    href={env.host + '/web/accounts/signup'}
                    target="_blank"
                    style={{textDecoration: 'none', color: '#008888'}}>
                    注册新帐号
                </a>
                <label>&nbsp;&nbsp;|&nbsp;&nbsp;</label>
                <a
                    href="https://www.aliyun.com/"
                    target="_blank"
                    style={{textDecoration: 'none', color: '#008888'}}>
                    安全中心
                </a>
                <label>&nbsp;&nbsp;|&nbsp;&nbsp;</label>
                <a
                    href="https://www.aliyun.com/"
                    target="_blank"
                    style={{textDecoration: 'none', color: '#008888'}}>
                    意见反馈
                </a>
            </div>
        );
    }

    private static renderOauthLogin() {
        return null;
    }

    public componentWillMount() {
        const queryParams = parseQueryString(window.location.search);
        const fromOrigin = queryParams.get('fromOrigin');

        this.onLoginNameChanged = this.onLoginNameChanged.bind(this);
        this.onLoginPasswordChanged = this.onLoginPasswordChanged.bind(this);
        this.onAccountLoginButtonClick = this.onAccountLoginButtonClick.bind(this);
        this.onSmsLoginPhoneChanged = this.onSmsLoginPhoneChanged.bind(this);
        this.onSmsLoginSmsCodeChanged = this.onSmsLoginSmsCodeChanged.bind(this);
        this.onSendSmsCodeClick = this.onSendSmsCodeClick.bind(this);
        this.onSmsLoginButtonClick = this.onSmsLoginButtonClick.bind(this);

        this.setState({
            queryParams,
            fromOrigin,
            errorMessage: {text: '', timestamp: new Date()},
            tabIndex: 0,
            loginName: '',
            loginPassword: '',
            loginPhone: '',
            loginSmsCode: '',
            smsCodeCountdown: 0
        });
    }

    public componentWillReceiveProps(nextProps: Props) {
        const errorMessage = nextProps.errorMessage;
        const {text, timestamp} = errorMessage;

        if (text !== this.props.errorMessage.text
            || timestamp !== this.props.errorMessage.timestamp) {
            this.setState({errorMessage});
        }
    }

    public render() {
        const {jwt} = this.props;
        if (jwt !== '') {
            this.postLoginSuccess(jwt);
        }

        const {tabIndex} = this.state;

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{width: '300px', marginTop: '24px'}}>
                    {this.renderTabs()}
                    <div style={{marginTop: '5px', height: '10px'}}>
                        {this.renderErrorMessage()}
                    </div>
                    {tabIndex === 0 && this.renderAccountLogin()}
                    {tabIndex === 1 && this.renderSmsLogin()}
                    <div style={{marginTop: '5px', height: '24px'}}>
                        {this.renderSuccessLabel()}
                    </div>
                    {LoginPage.renderLinks()}
                    {LoginPage.renderOauthLogin()}
                </div>
            </div>
        );
    }

    private renderTabs() {
        return (
            <Tabs
                indicatorColor={'#eee'}
                value={this.state.tabIndex}
                fullWidth={true}
                onChange={(event: {}, tabIndex: number) => {
                    this.setState({tabIndex});
                    this.onError('');
                }}>
                <Tab style={{color: '#008888'}} label="帐号密码登录"/>
                <Tab style={{color: '#008888'}}  label="短信验证码登录"/>
            </Tabs>
        );
    }

    private renderErrorMessage() {
        const {text, timestamp} = this.state.errorMessage;

        return (
            <TimedText
                text={text}
                timestamp={timestamp}
                intervalMillSec={3000}
                style={{fontSize: '14px', color: 'red'}}
            />
        );
    }

    private renderSuccessLabel() {
        const succeeded = this.props.jwt !== '';
        if (!succeeded) {
            return null;
        }

        return (
            <label style={{float: 'right', fontSize: 'x-small', color: '#888'}}>
                登录成功
            </label>
        );
    }

    private renderAccountLogin() {
        return (
            <div>
                {this.renderAccountLoginName()}
                {this.renderAccountLoginPassword()}
                {this.renderAccountLoginButton()}
            </div>
        );
    }

    private renderAccountLoginName() {
        return (
            <TextField
                margin="normal"
                fullWidth={true}
                label={'手机号'}
                value={this.state.loginName}
                onChange={this.onLoginNameChanged}
            />
        );
    }

    private onLoginNameChanged(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({loginName: e.target.value});
    }

    private renderAccountLoginPassword() {
        return (
            <TextField
                margin="normal"
                fullWidth={true}
                type={'password'}
                label={'密码'}
                value={this.state.loginPassword}
                onChange={this.onLoginPasswordChanged}
            />
        );
    }

    private onLoginPasswordChanged(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({loginPassword: e.target.value});
    }

    private renderAccountLoginButton() {
        return (
            <Button
                style={{
                    backgroundColor: '#008888',
                    fontSize: '150%',
                    color: '#fff',
                    width: '100%',
                    marginTop: '10px',
                    height: '48px',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderRadius: '8px',
                    borderColor: '#eee'
                }}
                onClick={this.onAccountLoginButtonClick}
            >
                <label style={{fontSize: '24px'}}>授权并登录</label>
            </Button>
        );
    }

    private onAccountLoginButtonClick() {
        const {loginName, loginPassword} = this.state;
        if (loginName === '') {
            return this.onError('！请输入手机号');
        }
        if (loginPassword === '') {
            return this.onError('！请输入密码');
        }

        this.props.apiLogin({
            name: loginName,
            password: loginPassword
        });
    }

    private renderSmsLogin() {
        return (
            <div>
                {this.renderSmsLoginPhone()}
                {this.renderSmsLoginSmsCodeContainer()}
                {this.renderSmsLoginButton()}
            </div>
        );
    }

    private renderSmsLoginPhone() {
        return (
            <TextField
                margin="normal"
                fullWidth={true}
                label={'手机号'}
                value={this.state.loginPhone}
                onChange={this.onSmsLoginPhoneChanged}
            />
        );
    }

    private onSmsLoginPhoneChanged(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({loginPhone: e.target.value});
    }

    private renderSmsLoginSmsCodeContainer() {
        return (
            <div>
                {this.renderSmsLoginSmsCode()}
                <div style={{height: '20px'}}>
                    {this.renderSmsCodeSentMessage()}
                </div>
                {this.renderSendSmsCodeButton()}
            </div>
        );
    }

    private renderSmsLoginSmsCode() {
        return (
            <TextField
                margin="normal"
                style={{width: '100px', float: 'left'}}
                label={'验证码'}
                value={this.state.loginSmsCode}
                onChange={this.onSmsLoginSmsCodeChanged}
            />
        );
    }

    private renderSmsCodeSentMessage() {
        const smsCodeSentMessage = this.props.smsCodeSentMessage;
        if (!smsCodeSentMessage) {
            return null;
        }

        const {text, timestamp} = smsCodeSentMessage;

        return (
            <TimedText
                text={text}
                timestamp={timestamp}
                intervalMillSec={3000}
                style={{fontSize: '14px', color: '#BBB', float: 'right'}}
            />
        );
    }

    private onSmsLoginSmsCodeChanged(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({loginSmsCode: e.target.value});
    }

    private renderSendSmsCodeButton() {
        const {smsCodeCountdown} = this.state;
        const disabled = smsCodeCountdown > 0;
        const backgroundColor = disabled ? '#eee' : '#008888';
        const color = disabled ? '#888' : '#fff';

        return (
            <Button
                style={{
                    backgroundColor,
                    float: 'right',
                    marginTop: '8px',
                    color,
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderRadius: '8px',
                    borderColor: '#eee'
                }}
                onClick={this.onSendSmsCodeClick}
                disabled={disabled}
            >
                {disabled ? smsCodeCountdown + '秒后重新发送' : '发送短信验证码'}
            </Button>
        );
    }

    private onSendSmsCodeClick() {
        const COUNT_DOWN_SECONDS = 60;

        const {loginPhone} = this.state;
        if (loginPhone === '') {
            return this.onError('！请输入手机号');
        }
        if (!checkPhone(loginPhone)) {
            return this.onError('！手机号格式不正确');
        }

        countdown(COUNT_DOWN_SECONDS, (n: number) => {
            this.setState({smsCodeCountdown: n});
        });

        this.props.apiSmsCode({
            scene: 'SMS_LOGIN',
            phone: loginPhone
        });
    }

    private renderSmsLoginButton() {
        return (
            <Button
                style={{
                    backgroundColor: '#008888',
                    fontSize: '150%',
                    color: '#fff',
                    width: '100%',
                    marginTop: '10px',
                    height: '48px',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderRadius: '8px',
                    borderColor: '#eee'
                }}
                onClick={this.onSmsLoginButtonClick}
            >
                <label style={{fontSize: 'large'}}>授权并登录</label>
            </Button>
        );
    }

    private onSmsLoginButtonClick() {
        const {loginPhone, loginSmsCode} = this.state;
        if (loginPhone === '') {
            return this.onError('！请输入手机号');
        }
        if (loginSmsCode === '') {
            return this.onError('！请输入验证码');
        }

        this.props.apiSmsLogin({
                phone: loginPhone,
                smsCode: loginSmsCode
            }
        );
    }

    private onError(message: string) {
        this.setState({errorMessage: {text: message, timestamp: new Date()}});
    }

    private postLoginSuccess(jwt: string) {
        const {fromOrigin} = this.state;
        if (!fromOrigin || fromOrigin === '') {
            return;
        }

        const loginSuccessAction: StandardAction = {type: 'onLoginCallback', payload: jwt};

        window.parent.postMessage(loginSuccessAction, decodeURIComponent(fromOrigin));
    }
}

const selectProps = (state: RootState) => ({
    jwt: state.jwt,
    errorMessage: state.errorMessage,
    smsCodeSentMessage: state.smsCodeSentMessage,
});

export default connect(selectProps, {
    apiSmsCode,
    apiSmsLogin,
    apiLogin,
})(LoginPage);