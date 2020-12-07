import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import ApiService from '../../../apiService.js';
import TwoFactorAuthForm from './TwoFactorAuthForm.jsx';

class TwoFactorAuth extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      enabled: false,
      setupStarted: false,
      disableStarted: false,
      dataUri: null,
      secret: null
    };
  }

  componentDidMount() {
    this.checkEnabled();
  }

  checkEnabled() {
    ApiService.submitAuthorizedApiRequest('/2fa/create', 'post', null, 
      (res) => {
        if(res.success) {
          this.setState({
            ready: true,
            dataUri: res.dataUri,
            secret: res.secret        
          });
        } else {
          this.setState({ 
            ready: true,
            enabled: true
          });
        }
      });
  }

  onTotpAuth() {
    this.setState({
      enabled: true,
      setupStarted: false
    });
  }

  onTotpDisable() {
    this.setState({
      disableStarted: true
    });
    ApiService.submitAuthorizedApiRequest('/2fa/disable', 'post', null, 
      (res) => {
        if(res.success) {
          this.setState({
            disableStarted: false,
            enabled: false,
            ready: false     
          });
          this.checkEnabled();
        }
      });
  }

  render() {
    if(!this.state.ready) {
      return (<div className='text-center' >
        <Spinner animation='border'></Spinner>
      </div>);
    }

    const actionButton = this.state.enabled ? <>
      <Button 
        variant='danger' 
        size='lg' 
        block
        onClick={this.onTotpDisable.bind(this)}  
      >
        Disable 2FA  {this.state.disableStarted && 
          <Spinner animation='border' size='sm' />}
      </Button>
    </> : <>
      <Button 
        variant='primary' 
        size='lg' 
        block 
        onClick={() => this.setState({ setupStarted: true })}>
        Enable 2FA  {this.state.setupStarted && 
          <Spinner animation='border' size='sm' />}
      </Button>
    </>;

    const setup = <>
      <p><strong>Step 1: </strong>
        Scan this QR code with your mobile phone app:</p>
      <img src={this.state.dataUri} alt='TOTP QR Code'/>
      <p><strong>OR: </strong>Enter this key:</p>
      <pre>{this.state.secret}</pre>
      <p><strong>Step 2: </strong> Enter code produced by app:</p>
      <TwoFactorAuthForm onAuth={this.onTotpAuth.bind(this)}/>
    </>;

    return (
      <>
        <h2 className='mb-4'>Two-Factor Authentication</h2>
        {this.state.setupStarted ? setup: actionButton}
      </>);
  }
}

export default TwoFactorAuth;