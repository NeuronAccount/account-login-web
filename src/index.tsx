import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import {  Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { rootReducer } from './redux';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import LoginPage from './loginPage/LoginPage';

let store = createStore(rootReducer, {}, applyMiddleware(thunk, logger));

const theme = createMuiTheme();

class Root extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <BrowserRouter>
                        <Route path="/" component={LoginPage}/>
                    </BrowserRouter>
                </MuiThemeProvider>
            </Provider>
        );
    }
}

ReactDOM.render(
    <Root/>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
