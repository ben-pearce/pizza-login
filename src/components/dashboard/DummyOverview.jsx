import React from 'react';
import { 
  Col, 
  Container, 
  Row, 
  Table, 
  Card, 
  Button, 
  Alert,
  Spinner
} from 'react-bootstrap';
import ApiService from '../../apiService.js';
import moment from 'moment';

export default class DummyOverview extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      session: null
    };
  }

  componentDidMount() {
    ApiService.submitAuthorizedApiRequest('/session', 'post', null, (res) => {
      if(res.success) {
        this.setState({ ready: true, session: res.session });
      }
    });
  }

  render(){
    if(!this.state.ready) {
      return (<div className='text-center' >
        <Spinner animation='border'></Spinner>
      </div>);
    }
    return (
      <>
        <Alert variant='warning'>
          This is a <strong>dummy page </strong> 
          to simulate some sensitive data being 
          displayed.
        </Alert>
        <h2>Overview</h2>
        <Container>
          <Row>
            <Col className='pl-0'>
              <h4>Details</h4>
              <ul className='list-unstyled'>
                <li><strong>Member Since</strong>: {
                  moment(this.state.session.registered_on).format('LL')
                }</li>
                <li><strong>Date of birth</strong>: {
                  moment(this.state.session.dob).format('LL')
                }</li>
                <li><strong>Pizzas ordered</strong>: 7</li>
              </ul>
            </Col>
            <Col>
              <h4>
                Your Address <Button variant='light' size='sm'>Edit</Button>
              </h4>
              <ul className='list-unstyled'>
                <li>
                  {this.state.session.first_name}&nbsp;
                  {this.state.session.last_name}
                </li>
                <li>{this.state.session.address.split('\n')[0]}</li>
                <li>{this.state.session.address.split('\n')[1]}</li>
                <li>{this.state.session.address.split('\n')[2]}</li>
              </ul>
            </Col>
          </Row>
        </Container>
        <h3>Order History</h3>
        <Card>
          <Table hover className='rounded mb-0'>
            <thead className='thead-light'>
              <tr>
                <th>Date</th>
                <th>Pizza</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['05/04/2020', 'Pepperoni', 16.50],
                ['29/03/2020', 'Pepperoni', 16.50],
                ['15/03/2020', 'Mozzarella', 12],
                ['30/02/2020', 'Hawaiian', 16],
                ['07/02/2020', 'Meatfeast', 17.50],
                ['25/01/2020', 'Pepperoni', 16.50],
                ['01/01/2020', 'Hawaiian', 16]
              ].map(([date, pizza, price], idx) =>
                <tr key={idx}>
                  <td>{date}</td>
                  <td>{pizza}</td>
                  <td>£{price.toFixed(2)}</td>
                </tr>)}
            </tbody>
          </Table>
        </Card>

      </>
    );
  }
}