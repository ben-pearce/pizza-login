import React from 'react';
import { Form, Button, Col, Spinner } from 'react-bootstrap';
import ApiService from '../../../apiService.js';
import PropTypes from 'prop-types';

class TwoFactorAuthForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false,
      error: null
    };
  }

  onSubmitToken(e) {
    e.preventDefault();
    this.setState({ isProcessing: true });

    const form = document.querySelector('form');
    const formData = new FormData(form);
    ApiService.submitAuthorizedApiRequest(
      '/2fa/auth', 
      'post', 
      formData,
      (resp) => {
        this.setState({ 
          isProcessing: false, 
          error: resp.error || this.state.error 
        });
        if(resp.success) {
          this.props.onAuth(resp);
        }
      });
  }

  render() {
    return (
      <Form>
        <Form.Row>
          <Col xs='auto'>
            <Form.Group>
              <Form.Control 
                name='totp_token'
                className='mb-2'
                placeholder='TOTP'
                type='text'
                readOnly={this.isProcessing}
                isInvalid={!!this.state.error}
                onChange={() => this.setState({ error: null })}
                maxLength={6}
              />
              <Form.Control.Feedback type='invalid'>
                {this.state.error}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs='auto'>
            <Button 
              type='submit' 
              className='mb-2' 
              onClick={this.onSubmitToken.bind(this)}
            >
              Submit {this.state.isProcessing && 
              <Spinner animation='border' size='sm' />}
            </Button>
          </Col>
        </Form.Row>
      </Form>
    );
  }
}

TwoFactorAuthForm.propTypes = {
  onAuth: PropTypes.func.isRequired
};

export default TwoFactorAuthForm;