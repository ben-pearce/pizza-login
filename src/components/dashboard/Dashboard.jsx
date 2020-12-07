import React from 'react';
import { 
  Button, 
  Card, 
  Col, 
  Container, 
  ListGroup, 
  Row, 
  Spinner 
} from 'react-bootstrap';
import DummyOverview from './DummyOverview.jsx';
import TwoFactorAuth from './twoFactorAuth/TwoFactorAuth.jsx';
import ChangePassword from './changePassword/ChangePassword.jsx';
import { 
  NavLink, 
  Redirect, 
  Route, 
  Switch, 
  withRouter 
} from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthenticationService from '../../authenticationService.js';
import ApiService from '../../apiService.js';
import moment from 'moment';

class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      session: null, 
      logoutProcessing: false
    };
  }

  componentDidMount() {
    ApiService.submitAuthorizedApiRequest('/session', 'post', null, (res) => {
      if(res.success) {
        this.setState({ ready: true, session: res.session });
      } else {
        AuthenticationService.logout(() => this.setState({ ready: false }));
      }
    });
  }

  onLogout() {
    this.setState({ logoutProcessing: true });
    AuthenticationService.logout(this.handleLogout.bind(this)); 
  }

  handleLogout(resp) {
    if(resp.success) {
      this.setState({ logoutProcessing: false });
    }
  }

  render() {
    if(!AuthenticationService.isLoggedIn()) {
      return <Redirect to='/login'/>;
    }
    let { path, url } = this.props.match;
    return (
      <Container className='mt-5 mb-5'>
        <Row>
          <Col sm={4}>
            <Card className='mb-3'>
              <Card.Body>
                {this.state.ready ? <>
                  <Card.Title>
                    Hello, {this.state.session.first_name}
                  </Card.Title>
                  <Card.Subtitle className='text-muted'>
                    Last Login:&nbsp;
                    {this.state.session.last_login === null 
                      ? 'Never' : moment(this.state.session.last_login)
                        .format('MMMM Do YYYY, h:mm a')}
                  </Card.Subtitle>
                </> : <>
                  <div className='text-center' >
                    <Spinner animation='border'></Spinner>
                  </div>
                </>}
              </Card.Body>
            </Card>
            <Card className='mb-3'>
              <Card.Header>Account</Card.Header>
              <ListGroup variant='flush' >
                <ListGroup.Item
                  as={NavLink}
                  to={`${url}/overview`}
                  action
                  className={'text-decoration-none'}>
                  Overview
                </ListGroup.Item>
              </ListGroup>
            </Card>
            <Card className='mb-3'>
              <Card.Header>Security</Card.Header>
              <ListGroup variant='flush' className='text-decoration-none'>
                <ListGroup.Item
                  as={NavLink}
                  to={`${url}/2fa`}
                  action
                  className={'text-decoration-none'}>
                  Two-Factor Authentication
                </ListGroup.Item>
                <ListGroup.Item
                  as={NavLink}
                  to={`${url}/change-password`}
                  action
                  className={'text-decoration-none'}>
                  Password
                </ListGroup.Item>
              </ListGroup>
            </Card>
            <Button 
              className='btn-block mb-2' 
              variant='outline-danger' 
              onClick={!this.state.logoutProcessing 
                ? this.onLogout.bind(this) : null}
            >
              {this.state.logoutProcessing ? <>
                Logout <Spinner animation='border' size='sm' />
              </> : 'Logout'}
            </Button>
          </Col>
          <Col sm={8}>
            <Card>
              <Card.Body>
                <Switch>
                  <Route exact path={path}>
                    <Redirect to={`${path}/overview`}/>
                  </Route>
                  <Route path={`${path}/overview`}>
                    <DummyOverview/>
                  </Route>
                  <Route path={`${path}/2fa`}>
                    <TwoFactorAuth/>
                  </Route>
                  <Route path={`${path}/change-password`}>
                    <ChangePassword/>
                  </Route>
                </Switch>
              </Card.Body>
            </Card>  
          </Col>
        </Row>
      </Container>
    );
  }
}

Dashboard.propTypes = {
  match: PropTypes.object.isRequired
};

export default withRouter(Dashboard);