import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';

class FormContainer extends React.Component {
  render() {
    return (
      <Container className='mt-5'>
        <Row className='justify-content-md-center'>
          <Col xs={4}>
            <Card>
              <Card.Header>{this.props.title}</Card.Header>
              <Card.Body>
                {this.props.children}
              </Card.Body>
              <Card.Footer>{this.props.footer}</Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

FormContainer.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  footer: PropTypes.element
};

export default FormContainer;