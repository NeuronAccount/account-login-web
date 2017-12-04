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
import AuthorizePage from './authorizePage/AuthorizePage';

let store = createStore(rootReducer, {}, applyMiddleware(thunk, logger));

const theme = createMuiTheme();

class Root extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <BrowserRouter>
                        <Route path="/" component={AuthorizePage}/>
                    </BrowserRouter>
                    <BrowserRouter>
                        <Route path="/oauth2/authorize" component={AuthorizePage}/>
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
