import React from 'react';
import BaseForm from '../BaseForm.jsx';
import { Redirect } from 'react-router';
import AuthenticationService from '../../authenticationService.js';
import TwoFactorAuthForm from '../dashboard/twoFactorAuth/TwoFactorAuthForm.jsx';

class LoginForm extends BaseForm {
  constructor(props) {
    super(props);

    this.action = '/login';
    this.method = 'post';
    this.fields = [
      ['Email Address', 'email', 'email', 'Enter email'],
      ['Password', 'password', 'password', 'Password']
    ];
    this.state.totp = false;
  }

  onServerReply(resp) {
    if(resp.success) {
      if(resp.requirement == 'totp') {
        this.setState({ totp: true });
      } else {
        AuthenticationService.login(resp.token);
        this.setState({ totp: false });
      }
      
    }
    super.onServerReply(resp);
  }

  render() {
    if(this.state.totp) {
      return <TwoFactorAuthForm onAuth={this.onServerReply.bind(this)}/>;
    }
    if(this.state.isComplete) {
      return <Redirect to='/dashboard'/>;
    }
    return super.render();
  }
}

export default LoginForm;