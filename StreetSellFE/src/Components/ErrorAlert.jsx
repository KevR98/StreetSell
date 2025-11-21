import { Container, Alert } from 'react-bootstrap';

const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <Container className='mt-5'>
      <Alert variant='danger'>Errore: {message}</Alert>
    </Container>
  );
};

export default ErrorAlert;
