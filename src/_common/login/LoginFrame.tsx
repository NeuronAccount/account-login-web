import * as React from "react";
import { connect } from "react-redux";
import {put} from "redux-saga/effects";
import {ACTION_LOGIN_SUCCESS, User} from "./redux_login";

export interface Props {
    loginUrl: string;
    style?: React.CSSProperties;
    onLoginCallback: (user: User) => void;
}

const DefaultStyle: React.CSSProperties = {
    position: "absolute",
    margin: "auto",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    width: "100%",
    height: "100%",
    // maxWidth: '721px',
    // maxHeight: '540px',
    borderColor: "#eee",
    borderWidth: "1px",
    backgroundColor: "#fff",
};

class LoginFrame extends React.Component<Props> {
    public componentWillMount() {
        this.loginFrameEventListener = this.loginFrameEventListener.bind(this);

        window.addEventListener("message", this.loginFrameEventListener);
    }

    public render() {
        const style = this.props.style ? this.props.style : DefaultStyle;
        const url = this.props.loginUrl +
            "?fromOrigin=" + encodeURIComponent(window.location.origin);

        return (
            <iframe style={style} src={url}/>
        );
    }

    private loginFrameEventListener(e: MessageEvent) {
        const data = e.data;
        switch (data.type) {
            case "onLoginCallback":
                const {userID, accessToken, refreshToken} = data.payload;
                const user: User = {userID, accessToken, refreshToken};
                put({type: ACTION_LOGIN_SUCCESS, payload: user});
                this.props.onLoginCallback(user);
                break;
            default:
                return;
        }
    }
}

export default connect(null, {
})(LoginFrame);
