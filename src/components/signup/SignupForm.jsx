import React from 'react';
import { Alert } from 'react-bootstrap';
import BaseForm from '../BaseForm.jsx';


class SignupForm extends BaseForm {

  constructor(props) {
    super(props);

    this.action = '/signup';
    this.method = 'put';
    this.fields = [
      ['First Name', 'fname', 'text', 'Enter first name'],
      ['Last Name', 'lname', 'text', 'Enter last name'],
      ['Email Address', 'email', 'email', 'Enter email'],
      ['Password', 'password', 'password', 'Password'],
      ['Confirm Password', 'confirm', 'password', 'Password']
    ];
  }

  render() {
    if(this.state.isComplete) {
      return (
        <Alert variant='success'>
          <Alert.Heading>Success!</Alert.Heading>
          <p>You have successfully registered!</p>
        </Alert>
      );
    }
    return super.render();
  }
}

export default SignupForm;