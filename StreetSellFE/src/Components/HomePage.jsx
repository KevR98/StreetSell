import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <Container className='py-5 text-center'>
      <div className='py-5'>
        <h1 className='display-4 fw-bold'>BENVENUTO A STREETSELL</h1>
        <p className='mt-3'>
          Per continuare effettua <Link to='/login'>login</Link> o{' '}
          <Link to='/register'>registrati!</Link>
        </p>
      </div>
    </Container>
  );
}

export default HomePage;
