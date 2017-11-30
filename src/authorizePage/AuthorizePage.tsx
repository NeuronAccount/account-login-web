import * as React from "react";
import Tabs, { Tab } from 'material-ui/Tabs';
import Button from "material-ui/Button";
import {
    AccountLoginParams,
    apiAccountLogin, ApiError, apiSmsCode, apiSmsLogin, apiSmsSignup, RootState, SmsLoginParams,
    SmsSignupParams
} from "../redux";
import {connect} from "react-redux";
import {TextField} from "material-ui";
import {LoginResponse, OAuth2AuthorizeParams} from "../api/account/gen/api";

//const scope="stock-assistant";

interface Props {
    loginResponse: LoginResponse

    apiSmsCode: (params: { scene: string, phone: string, captchaId?: string, captchaCode?: string },
                 onSuccess: () => void,
                 onError: (err: ApiError) => void) => any
    apiSmsSignup: (params: SmsSignupParams,
                   onSuccess: (loginResponse: LoginResponse) => void,
                   onError: (err: ApiError) => void) => any
    apiSmsLogin: (params: SmsLoginParams,
                  onSuccess: (loginResponse: LoginResponse) => void,
                  onError: (err: ApiError) => void) => any
    apiAccountLogin: (params: AccountLoginParams,
                      onSuccess: (loginResponse: LoginResponse) => void,
                      onError: (err: ApiError) => void) => any
}

interface State {
    queryParams:Map<string,string>
    oAuth2Params:OAuth2AuthorizeParams
    inputError: string
    inputErrorTimer:any,
    inputErrorNotifyStartTime:Date,
    isSignupView: boolean
    loginTabIndex: number
    loginName: string
    loginPassword: string
    loginPhone: string
    loginSmsCode: string
    signupPhone: string
    signupSmsCode: string
    signupPassword:string
}

class AuthorizePage extends React.Component<Props,State> {
    componentWillMount() {
        let queryParamsMap = new Map<string, string>();
        if (window.location.search.startsWith("?")) {
            window.location.search.substring(1).split("&").forEach((pair) => {
                const tokens = pair.split("=");
                if (tokens.length > 1) {
                    queryParamsMap.set(tokens[0], tokens[1])
                } else {
                    queryParamsMap.set(tokens[0], "")
                }
            })
        }

        let oAuth2Params: OAuth2AuthorizeParams = {
            responseType:queryParamsMap.get("response_type"),
            clientId:queryParamsMap.get("client_id"),
            scope:queryParamsMap.get("scope"),
            redirectUri:queryParamsMap.get("redirect_uri"),
            state:queryParamsMap.get("state")
        };

        this.setState({
            queryParams: queryParamsMap,
            oAuth2Params: oAuth2Params,
            inputError: "",
            isSignupView: false,
            loginTabIndex: 0,
            loginName: "",
            loginPassword: "",
            loginPhone: "",
            loginSmsCode: "",
            signupPhone: "",
            signupSmsCode: "",
            signupPassword: ""
        });

        this.onLoginSuccess = this.onLoginSuccess.bind(this);
        this.onApiError = this.onApiError.bind(this);
    }

    onLoginSuccess(loginResponse: LoginResponse) {
        console.log(this.state);

        const params = this.state.oAuth2Params;
        if (params.redirectUri == null || params.redirectUri == "") {
            return
        }

        let url = params.redirectUri + "?code=" + loginResponse.jwt;

        if (params.state != null && params.state != "") {
            url += "&state=" + params.state
        }

        window.location.href = url
    }

    onApiError(err: ApiError) {
        this.onLoginInputError(err.message)
    }

    onLoginInputError(message: string) {
        if (this.state.inputErrorTimer != null) {
            clearInterval(this.state.inputErrorTimer)
        }

        this.setState({inputError: message, inputErrorNotifyStartTime: new Date()});

        if (message == null || message == "") {
            return
        }

        let t = setInterval(() => {
            if (new Date().getTime() - this.state.inputErrorNotifyStartTime.getTime() > 3000) {
                this.setState({inputError: ""});
                clearInterval(t)
            }
        }, 200);

        this.setState({inputErrorTimer: t})
    }

    renderSmsSignup() {
        return (
            <div>
                <TextField margin="normal" fullWidth={true}
                           label={"手机号"}
                           value={this.state.signupPhone}
                           onChange={(e) => {
                               this.setState({signupPhone: e.target.value})
                           }}
                />
                <TextField margin="normal" fullWidth={true} type={"password"}
                           label={"密码"}
                           value={this.state.signupPassword}
                           onChange={(e) => {
                               this.setState({signupPassword: e.target.value})
                           }}
                />
                <div>
                    <TextField margin="normal" style={{width: "100px", float: "left"}}
                               label={"验证码"}
                               value={this.state.signupSmsCode}
                               onChange={(e) => {
                                   this.setState({signupSmsCode: e.target.value})
                               }}
                    />
                    <Button style={{float: "right", marginTop: "30px", backgroundColor: "#3487ff", color: "#FFF"}}
                            onClick={() => {
                                if (this.state.signupPhone == null || this.state.signupPhone == "") {
                                    return this.onLoginInputError("！请输入手机号")
                                }

                                this.props.apiSmsCode({scene: "SMS_SIGNUP", phone: this.state.signupPhone},
                                    () => {
                                    },
                                    (err) => {
                                        this.onLoginInputError(err.message)
                                    })
                            }}>
                        发送短信验证码
                    </Button>
                </div>
                <Button style={{backgroundColor: "#3487ff", color: "#FFF", width: "100%", marginTop: "20px"}}
                        onClick={() => {
                            if (this.state.signupPhone == null || this.state.signupPhone == "") {
                                return this.onLoginInputError("！请输入手机号")
                            }

                            if (this.state.signupPassword == null || this.state.signupPassword == "") {
                                return this.onLoginInputError("！请输入密码")
                            }

                            if (this.state.signupSmsCode == null || this.state.signupSmsCode == "") {
                                return this.onLoginInputError("！请输入验证码")
                            }

                            this.props.apiSmsSignup({
                                    phone: this.state.signupPhone,
                                    smsCode: this.state.signupSmsCode,
                                    password: this.state.signupPassword
                                },
                                this.onLoginSuccess,
                                this.onApiError)
                        }}>
                    <label style={{fontSize: "xx-large"}}>注 册</label>
                </Button>
            </div>
        )
    }

    renderSignup() {
        return (
            <div>
                <Button dense={true} style={{float: "left"}} onClick={() => {
                    this.setState({isSignupView: false});
                    this.onLoginInputError("")
                }}>
                    <label style={{color: "#EEE"}}>返回</label>
                </Button>
                <label style={{
                    width: "300px",
                    position: "absolute",
                    margin: "auto",
                    top: "120px",
                    left: 0,
                    right: 0,
                    display: "inline-block",
                    fontSize: "xx-large",
                    textAlign:"center",
                    color:"#FFF"
                }}>
                    注册火星帐号
                </label>
                <div style={{
                    width: "300px",
                    backgroundColor: "#FFF",
                    position: "absolute",
                    margin: "auto",
                    left: 0,
                    right: 0,
                    top: "200px"
                }}>
                    <div style={{marginLeft: "20px", marginRight: "20px", marginBottom: "20px"}}>
                        <div style={{marginTop: "5px", height: "10px"}}>
                            <label style={{fontSize: "50%", color: "red"}}>{this.state.inputError}</label>
                        </div>
                        {this.renderSmsSignup()}
                    </div>
                </div>
            </div>
        )
    }

    renderAccountLogin() {
        return (
            <div>
                <TextField margin="normal" fullWidth={true}
                           label={"手机号"}
                           value={this.state.loginName}
                           onChange={(e) => {
                               this.setState({loginName: e.target.value})
                           }}
                />
                <TextField margin="normal" fullWidth={true} type={"password"}
                           label={"密码"}
                           value={this.state.loginPassword}
                           onChange={(e) => {
                               this.setState({loginPassword: e.target.value})
                           }}
                />
                <Button style={{backgroundColor: "#3487ff", color: "#FFF", width: "100%", marginTop: "20px"}}
                        onClick={() => {
                            if (this.state.loginName == null || this.state.loginName == "") {
                                return this.onLoginInputError("！请输入手机号")
                            }

                            if (this.state.loginPassword == null || this.state.loginPassword == "") {
                                return this.onLoginInputError("！请输入密码")
                            }

                            this.props.apiAccountLogin({
                                    name: this.state.loginName,
                                    password: this.state.loginPassword
                                },
                                this.onLoginSuccess,
                                this.onApiError
                            )
                        }}>
                    <label style={{fontSize: "xx-large"}}>登 录</label>
                </Button>
            </div>
        )
    }

    renderSmsLogin() {
        return (
            <div>
                <TextField margin="normal" fullWidth={true}
                           label={"手机号"}
                           value={this.state.loginPhone}
                           onChange={(e) => {
                               this.setState({loginPhone: e.target.value})
                           }}
                />
                <div>
                    <TextField margin="normal" style={{width: "100px"}}
                               label={"验证码"}
                               value={this.state.loginSmsCode}
                               onChange={(e) => {
                                   this.setState({loginSmsCode: e.target.value})
                               }}
                    />
                    <Button style={{float: "right", marginTop: "30px", backgroundColor: "#3487ff", color: "#FFF"}}
                            onClick={() => {
                                if (this.state.loginPhone == null || this.state.loginPhone == "") {
                                    return this.onLoginInputError("！请输入手机号")
                                }

                                this.props.apiSmsCode({scene: "SMS_LOGIN", phone: this.state.loginPhone}, () => {
                                }, this.onApiError)
                            }}>
                        发送短信验证码
                    </Button>
                </div>
                <Button style={{backgroundColor: "#3487ff", color: "#FFF", width: "100%", marginTop: "20px"}}
                        onClick={() => {
                            if (this.state.loginPhone == null || this.state.loginPhone == "") {
                                return this.onLoginInputError("！请输入手机号")
                            }

                            if (this.state.loginSmsCode == null || this.state.loginSmsCode == "") {
                                return this.onLoginInputError("！请输入验证码")
                            }

                            this.props.apiSmsLogin({
                                    phone: this.state.loginPhone,
                                    smsCode: this.state.loginSmsCode
                                },
                                this.onLoginSuccess,
                                this.onApiError
                            )
                        }}>
                    <label style={{fontSize: "xx-large"}}>登 录</label>
                </Button>
            </div>
        )
    }

    renderLogin() {
        return (
            <div>
                <Button dense={true} style={{float: "right"}} onClick={() => {
                    this.setState({isSignupView: true});
                    this.onLoginInputError("")
                }}>
                    <label style={{color: "#EEE"}}>新用户注册</label>
                </Button>
                <label style={{
                    width: "300px",
                    position: "absolute",
                    margin: "auto",
                    top: "120px",
                    left: 0,
                    right: 0,
                    display: "inline-block",
                    fontSize: "xx-large",
                    textAlign:"center",
                    color:"#FFF"
                }}>
                    登录火星帐号
                </label>
                <div style={{
                    width: "300px",
                    backgroundColor: "#FFF",
                    position: "absolute",
                    margin: "auto",
                    left: 0,
                    right: 0,
                    top: "200px"
                }}>
                    <Tabs value={this.state.loginTabIndex} fullWidth={true} onChange={(event: any, v: any) => {
                        this.setState({loginTabIndex: v});
                        this.onLoginInputError("")
                    }}>
                        <Tab label="密码登录"/>
                        <Tab label="短信验证码登录"/>
                    </Tabs>
                    <div style={{marginLeft: "20px", marginRight: "20px", marginBottom: "20px"}}>
                        <div style={{marginTop: "5px", height: "10px"}}>
                            <label style={{fontSize: "50%", color: "red"}}>{this.state.inputError}</label>
                        </div>
                        {this.state.loginTabIndex == 0 && this.renderAccountLogin()}
                        {this.state.loginTabIndex == 1 && this.renderSmsLogin()}
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div>
                <div style={{
                    maxWidth: "480px",
                    maxHeight: "600px",
                    backgroundColor: "#333",
                    position: "absolute",
                    margin: "auto",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0"
                }}>
                    {this.state.isSignupView ? this.renderSignup() : this.renderLogin()}
                </div>
            </div>
        )
    }
}

function selectProps(state:RootState) {
    return {
        loginResponse: state.loginResponse
    }
}

export default  connect(selectProps,{
    apiSmsCode,
    apiSmsSignup,
    apiSmsLogin,
    apiAccountLogin,
})(AuthorizePage)