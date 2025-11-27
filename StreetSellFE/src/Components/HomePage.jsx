import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <Container
      fluid
      className='d-flex flex-column align-items-center justify-content-center text-center'
      style={{
        minHeight: '80vh',
        // 🔥 RIMOSSO: paddingTop è gestito da chi lo chiama o si centra da solo
        paddingBottom: '60px', // Mantenuto per non essere coperto dalla Navbar inferiore
      }}
    >
      <div className='py-5 px-3'>
        <h1 className='fs-2 fs-md-1 fw-bold mb-4'>
          Esplora la Tua Piazza Digitale
        </h1>

        <p
          className='fs-6 fs-md-5 lead mt-3 mx-auto'
          style={{ maxWidth: '600px' }}
        >
          Benvenuto/a su StreetSell, il marketplace dove trovi occasioni uniche
          e puoi mettere in vendita i tuoi prodotti con facilità. Per iniziare
          la tua avventura di compravendita e accedere a tutte le funzionalità,
          devi solo unirti alla nostra community.
        </p>

        <div className='mt-4 fs-6 fs-md-5'>
          <p className='mb-1'>
            Hai già un account?{' '}
            <Link to='/login' className='fw-bold text-decoration-none'>
              Accedi ora
            </Link>
          </p>
          <p className='mb-0'>
            Sei nuovo/a?{' '}
            <Link to='/register' className='fw-bold text-decoration-none'>
              Registrati subito!
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}

export default HomePage;
