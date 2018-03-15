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
import { rootReducer, RootState } from './redux';

const theme = createMuiTheme();
const logger = createLogger({collapsed: false});
export const REDUX_STORE = createStore<RootState>(rootReducer, composeWithDevTools(applyMiddleware(thunk, logger)));

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
    document.getElementById('root') as HTMLElement
);