import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";
import { applyMiddleware, createStore } from "redux";
import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga"
import {StandardAction} from "./_common/action";
import App from "./App";
import { rootReducer, RootState } from "./redux";
import rootSaga from "./sagas";

const theme = createMuiTheme();

const logger = createLogger({collapsed: false});
const saga=createSagaMiddleware();
export const REDUX_STORE = createStore<RootState,StandardAction<any>,any,any>(
    rootReducer, applyMiddleware(saga, logger));
saga.run(rootSaga);

class Root extends React.Component {
    public render() {
        return (
            <Provider store={REDUX_STORE}>
                <MuiThemeProvider theme={theme}>
                    <BrowserRouter>
                        <Route path="/" component={App}/>
                    </BrowserRouter>
                </MuiThemeProvider>
            </Provider>
        );
    }
}

ReactDOM.render(
    <Root />,
    document.getElementById("root") as HTMLElement,
);
