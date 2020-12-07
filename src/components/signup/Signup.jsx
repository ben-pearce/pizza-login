import React from 'react';
import FormContainer from '../FormContainer.jsx';
import SignupForm  from './SignupForm.jsx';
import { Link } from 'react-router-dom';


export default function Signup() {
  const footer = (<>Got an account? <Link to='login'>Sign in</Link>.</>);
  return (
    <FormContainer title='Create An Account' footer={footer}>
      <SignupForm/>
    </FormContainer>
  );
}
