import { createMuiTheme, MuiThemeProvider } from 'material-ui';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import App from './App';
import { rootReducer } from './redux';

const logger = createLogger({collapsed: false});

const store = createStore(rootReducer, {}, composeWithDevTools(applyMiddleware(thunk, logger)));

const theme = createMuiTheme();

class Root extends React.Component {
    public render() {
        return (
            <Provider store={store}>
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
    document.getElementById('root') as HTMLElement
);