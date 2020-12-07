import React from 'react';
import Config from '../../pizza.config.js';
import { Alert, Form, Button, Spinner } from 'react-bootstrap';
import { ReCaptcha } from 'react-recaptcha-v3';
import ApiService from '../apiService.js';

class BaseForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false,
      isComplete: false,
      errors: {}
    };
    
    this.recaptcha = null;
    this.action = null;
    this.method = null;
    this.fields = [];
  }

  onSubmitForm(e) {
    if(!this.state.isProcessing) {
      e.preventDefault();
      this.setState({isProcessing: true}, this.recaptcha.execute);
    }
  }

  onRecaptchaReply(token) {
    if(this.state.isProcessing) {
      const form = document.querySelector('form');
      const formData = new FormData(form);
      formData.append('captcha', token);

      ApiService.submitAuthorizedApiRequest(
        this.action, 
        this.method, 
        formData, 
        this.onServerReply.bind(this)
      );
    }
  }

  onServerReply(resp) {
    if(resp.success) {
      document.querySelector('form').reset();
    }

    this.setState({
      isProcessing: false,
      isComplete: resp.success,
      errors: resp.errors || (resp.success ? {} : this.state.errors)
    });
  }

  getErrors(entry) {
    if(!(entry in this.state.errors)) {
      return null;
    } else if(this.state.errors[entry].length == 1) {
      return this.state.errors[entry][0];
    } else {
      return (<ul>{this.state.errors[entry].map(
        (error, idx) => <li key={idx}>{error}</li>
      )}</ul>);
    }
  }

  onEntryChange(e) {
    if(e.target.name in this.state.errors) {
      delete this.state.errors[e.target.name];
      this.setState({errors: this.state.errors});
    }
  }

  render() {
    return (
      <>
        {
          !!this.state.errors.general && 
          !this.state.isProcessing &&
          <>
            <Alert variant='danger'>
              {this.state.errors.general}
            </Alert>
          </>
        }
        <Form>
          {this.fields.map(([label, name, type, placeholder], idx) => (
            <Form.Group key={idx}>
              <Form.Label>{label}</Form.Label>
              <Form.Control 
                name={name} 
                type={type}
                placeholder={placeholder}
                readOnly={this.state.isProcessing} 
                onChange={this.onEntryChange.bind(this)}
                isInvalid={name in this.state.errors}
              />
              <Form.Control.Feedback type='invalid'>
                {this.getErrors(name)}
              </Form.Control.Feedback>
            </Form.Group>
          ))}
          <Button 
            variant='primary' 
            type='submit' 
            disabled={this.state.isProcessing}
            onClick={this.onSubmitForm.bind(this)}
            className='float-right'
          >
            Submit {this.state.isProcessing && 
              <Spinner animation='border' size='sm' />}
          </Button>
        </Form>
        <ReCaptcha
          ref={ref => this.recaptcha = ref}
          sitekey={Config.recaptchaSiteKey}
          action={this.constructor.name}
          verifyCallback={this.onRecaptchaReply.bind(this)}
        />
      </>
    );

  }
}

export default BaseForm;