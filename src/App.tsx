import * as React from 'react';
import LoginPage from './loginPage/LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { Route } from 'react-router';

export default class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Route path="/" component={LoginPage}/>
            </BrowserRouter>
        );
    }
}