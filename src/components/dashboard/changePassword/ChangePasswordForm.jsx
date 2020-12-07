import React from 'react';
import BaseForm from '../../BaseForm.jsx';
import { Alert } from 'react-bootstrap';

class ChangePasswordForm extends BaseForm {

  constructor(props) {
    super(props);

    this.action = '/change-password';
    this.method = 'post';
    this.fields = [
      ['Current Password', 'current', 'password', 'Password'],
      ['New Password', 'password', 'password', 'Password'],
      ['Confirm New Password', 'confirm', 'password', 'Password']
    ];
  }

  render() {
    return (
      <>
        {
          this.state.isComplete && <>
            <Alert variant='success'>
              <Alert.Heading>Success!</Alert.Heading>
              <p>You have updated your password.</p>
            </Alert>
          </>
        }
        {super.render()}
      </>
    );
  }
}

export default ChangePasswordForm;