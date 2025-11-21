import { Container, Spinner } from 'react-bootstrap';

function LoadingSpinner() {
  return (
    <Container className='mt-5 text-center'>
      <Spinner animation='border' variant='primary' role='status'>
        <span className='visually-hidden'>Caricamento...</span>
      </Spinner>
    </Container>
  );
}

export default LoadingSpinner;
