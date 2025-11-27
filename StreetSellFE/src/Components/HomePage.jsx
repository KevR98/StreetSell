import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    // Utilizziamo le classi Flexbox per centrare il contenuto verticalmente e orizzontalmente
    <Container
      fluid
      className='d-flex flex-column align-items-center justify-content-center text-center'
      style={{
        minHeight: '80vh',
        paddingTop: '60px',
        paddingBottom: '60px',
      }}
    >
      <div className='py-5 px-3'>
        {' '}
        {/* Aggiungo padding orizzontale su mobile */}
        {/* 🔥 MODIFICA 1: Titolo più piccolo su mobile (fs-2 vs fs-md-1) */}
        <h1 className='fs-2 fs-md-1 fw-bold mb-4'>
          Esplora la Tua Piazza Digitale
        </h1>
        {/* 🔥 MODIFICA 2: Testo lead più piccolo su mobile (fs-6 o small text) */}
        <p
          className='fs-6 fs-md-5 lead mt-3 mx-auto'
          style={{ maxWidth: '600px' }}
        >
          Benvenuto/a su StreetSell, il marketplace dove trovi occasioni uniche
          e puoi mettere in vendita i tuoi prodotti con facilità. Per iniziare
          la tua avventura di compravendita e accedere a tutte le funzionalità,
          devi solo unirti alla nostra community.
        </p>
        {/* 🔥 MODIFICA 3: Link di Login e Registrazione più piccoli su mobile (fs-6) */}
        <div className='mt-4 fs-6 fs-md-5'>
          <p className='mb-1'>
            {' '}
            {/* Rimuovo margine tra le righe per compattezza mobile */}
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
