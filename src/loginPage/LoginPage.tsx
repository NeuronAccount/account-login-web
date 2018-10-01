import { Button, TextField } from "material-ui";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatchable, StandardAction } from "../_common/action";
import { checkPhone, parseQueryString } from "../_common/common";
import { countdown } from "../_common/countdown";
import { default as TimedText, TextTimestamp } from "../_common/TimedText";
import { sendLoginSmsCodeParams, smsLoginParams, UserToken } from "../api/account/gen";
import {
    apiSendLoginSmsCode, apiSmsLogin, RootState,
} from "../redux";

export const MAX_LOGIN_NAME_LENGTH = 24;
export const MAX_PHONE_LENGTH = 11;
export const MAX_PASSWORD_LENGTH = 20;
export const MAX_SMS_CODE_LENGTH = 6;

interface Props {
    userToken: UserToken;
    errorMessage: TextTimestamp;
    smsCodeSentMessage: TextTimestamp;

    apiSendLoginSmsCode: (p: sendLoginSmsCodeParams) => Dispatchable;
    apiSmsLogin: (p: smsLoginParams) => Dispatchable;
}

interface State {
    queryParams: Map<string, string>;
    fromOrigin?: string;
    errorMessage: TextTimestamp;
    loginPhone: string;
    loginSmsCode: string;
    smsCodeCountdown: number;
}

class LoginPage extends React.Component<Props, State> {
    private static renderOauthLogin() {
        return null;
    }

    public componentWillMount() {
        const queryParams = parseQueryString(window.location.search);
        const fromOrigin = queryParams.get("fromOrigin");

        this.onSmsLoginPhoneChanged = this.onSmsLoginPhoneChanged.bind(this);
        this.onSmsLoginSmsCodeChanged = this.onSmsLoginSmsCodeChanged.bind(this);
        this.onSendLoginSmsCodeClick = this.onSendLoginSmsCodeClick.bind(this);
        this.onSmsLoginButtonClick = this.onSmsLoginButtonClick.bind(this);

        this.setState({
            errorMessage: {text: "", timestamp: new Date()},
            fromOrigin,
            loginPhone: "",
            loginSmsCode: "",
            queryParams,
            smsCodeCountdown: 0,
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
        const {userToken} = this.props;
        if (userToken.accessToken !== "") {
            this.postLoginSuccess(userToken);
        }

        return (
            <div style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            }}>
                <div style={{width: "300px", marginTop: "24px"}}>
                    <div style={{marginTop: "5px", height: "10px"}}>
                        {this.renderErrorMessage()}
                    </div>
                    {this.renderSmsLogin()}
                    <div style={{marginTop: "5px", height: "24px"}}>
                        {this.renderSuccessLabel()}
                    </div>
                    {LoginPage.renderOauthLogin()}
                </div>
            </div>
        );
    }

    private renderErrorMessage() {
        const {text, timestamp} = this.state.errorMessage;

        return (
            <TimedText
                text={text}
                timestamp={timestamp}
                intervalMillSec={3000}
                style={{fontSize: "14px", color: "red"}}
            />
        );
    }

    private renderSuccessLabel() {
        const {userToken} = this.props;
        const succeeded = userToken && userToken.accessToken !== "";
        if (!succeeded) {
            return null;
        }

        return (
            <label style={{float: "right", fontSize: "x-small", color: "#888"}}>
                登录成功
            </label>
        );
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
                label={"手机号"}
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
                <div style={{height: "20px"}}>
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
                style={{width: "100px", float: "left"}}
                label={"验证码"}
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
                style={{fontSize: "14px", color: "#BBB", float: "right"}}
            />
        );
    }

    private onSmsLoginSmsCodeChanged(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({loginSmsCode: e.target.value});
    }

    private renderSendSmsCodeButton() {
        const {smsCodeCountdown} = this.state;
        const disabled = smsCodeCountdown > 0;
        const backgroundColor = disabled ? "#eee" : "#008888";
        const color = disabled ? "#888" : "#fff";

        return (
            <Button
                style={{
                    backgroundColor,
                    borderColor: "#eee",
                    borderRadius: "8px",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    color,
                    float: "right",
                    marginTop: "8px",
                }}
                onClick={this.onSendLoginSmsCodeClick}
                disabled={disabled}
            >
                {disabled ? smsCodeCountdown + "秒后重新发送" : "发送短信验证码"}
            </Button>
        );
    }

    private renderSmsLoginButton() {
        return (
            <Button
                style={{
                    backgroundColor: "#008888",
                    borderColor: "#eee",
                    borderRadius: "8px",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    color: "#fff",
                    fontSize: "150%",
                    height: "48px",
                    marginTop: "10px",
                    width: "100%",
                }}
                onClick={this.onSmsLoginButtonClick}
            >
                <label style={{fontSize: "large"}}>授权并登录</label>
            </Button>
        );
    }

    private onSendLoginSmsCodeClick() {
        const COUNT_DOWN_SECONDS = 60;

        const {loginPhone} = this.state;
        if (loginPhone === "") {
            return this.onError("！请输入手机号");
        }
        if (!checkPhone(loginPhone)) {
            return this.onError("！手机号格式不正确");
        }

        countdown(COUNT_DOWN_SECONDS, (n: number) => {
            this.setState({smsCodeCountdown: n});
        });

        this.props.apiSendLoginSmsCode({
            captchaCode: "1",
            captchaId: "1",
            phone: loginPhone,
        });
    }

    private onSmsLoginButtonClick() {
        const {loginPhone, loginSmsCode} = this.state;
        if (loginPhone === "") {
            return this.onError("！请输入手机号");
        }
        if (loginSmsCode === "") {
            return this.onError("！请输入验证码");
        }

        this.props.apiSmsLogin({
                phone: loginPhone,
                smsCode: loginSmsCode,
            },
        );
    }

    private onError(message: string) {
        this.setState({errorMessage: {text: message, timestamp: new Date()}});
    }

    private postLoginSuccess(userToken: UserToken) {
        const {fromOrigin} = this.state;
        if (!fromOrigin || fromOrigin === "") {
            return;
        }

        const loginSuccessAction: StandardAction = {type: "onLoginCallback", payload: userToken};

        window.parent.postMessage(loginSuccessAction, decodeURIComponent(fromOrigin));
    }
}

const selectProps = (rootState: RootState) => ({
    errorMessage: rootState.errorMessage,
    smsCodeSentMessage: rootState.smsCodeSentMessage,
    userToken: rootState.userToken,
});

export default connect(selectProps, {
    apiSendLoginSmsCode,
    apiSmsLogin,
})(LoginPage);
