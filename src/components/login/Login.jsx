import React from 'react';
import FormContainer from '../FormContainer.jsx';
import LoginForm  from './LoginForm.jsx';
import { Link } from 'react-router-dom';

export default function Login() {
  const footer = (
    <>Don&apos;t have an account? <Link to='signup'>Create one</Link>.</>
  );
  return (
    <FormContainer title='Login' footer={footer}>
      <LoginForm/>
    </FormContainer>
  );
}