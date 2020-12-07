import React from 'react';
import { 
  BrowserRouter as Router, 
  Redirect, 
  Route, 
  Switch
} from 'react-router-dom';
import Login from './login/Login.jsx';
import Signup from './signup/Signup.jsx';
import Dashboard from './dashboard/Dashboard.jsx';
import Config from '../../pizza.config.js';
import AuthenticationService from '../authenticationService.js';
import { loadReCaptcha } from 'react-recaptcha-v3';

class App extends React.Component {

  componentDidMount() {
    loadReCaptcha(Config.recaptchaSiteKey);
  }

  render() {
    
    return (
      <Router>
        <Switch>
          <Route 
            exact 
            path='/'
            render={
              () => AuthenticationService.isLoggedIn()
                ? <Redirect to='/dashboard'/> : <Redirect to='/login'/>
            }
          />
          <Route 
            path='/login'
            render={
              () => AuthenticationService.isLoggedIn() 
                ? <Redirect to='/dashboard'/> : <Login/>
            }
          />
          <Route 
            path='/signup'
            render={
              () => AuthenticationService.isLoggedIn() 
                ? <Redirect to='/dashboard'/> : <Signup/>
            }
          />
          <Route 
            path='/dashboard' 
            render={
              () => AuthenticationService.isLoggedIn()
                ? <Dashboard/> : <Redirect to='/login'/>
            }
          />
        </Switch>
      </Router>
    );
  }
}

export default App;