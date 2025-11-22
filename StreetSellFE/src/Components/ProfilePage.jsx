import { Alert, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import RecensioniList from './RecensioniList';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';

function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // 2. Stato di Caricamento (Lo username è già stato caricato in App.js,
  // ma usiamo un controllo di base)
  if (!isAuthenticated) {
    // Se non autenticato, reindirizziamo o mostriamo un messaggio
    return (
      <Container className='mt-5'>
        <Alert variant='warning'>
          Accesso negato. Effettua il <a href='/login'>login</a> per
          visualizzare il tuo profilo.
        </Alert>
      </Container>
    );
  }

  // 3. Controllo se i dati sono ancora in transizione (dopo il fetch in App.js)
  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Container className='my-5'>
      <BackButton />
      <h1 className='mb-4'>👋 Benvenuto nel Tuo Profilo, {user.username}</h1>
      <Row>
        {/* ======================================================= */}
        {/* COLONNA 1 (md=8): RECENSIONI RICEVUTE (Contenuto principale) */}
        {/* ======================================================= */}
        <Col md={8}>
          <RecensioniList utenteId={user.id} />
          {/* 🛑 IMPLEMENTAZIONE QUI: Passiamo l'ID dell'utente loggato al componente */}
        </Col>

        {/* ======================================================= */}
        {/* COLONNA 2 (md=4): DETTAGLI UTENTE E AZIONI RAPIDE */}
        {/* ======================================================= */}
        <Col md={4}>
          {/* Blocco 1: Dettagli Utente (Spostato qui) */}
          <Card className='shadow-sm mb-4'>
            <Card.Header as='h5' className='bg-primary text-white'>
              Dettagli Account
            </Card.Header>
            <Card.Body>
              {/* (Mantieni qui tutte le Row con ID, Username, Email, Ruolo...) */}
              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  ID Utente:
                </Col>
                <Col xs={8} className='text-break'>
                  {user.id}
                </Col>
              </Row>
              {/* ... Altre righe con Email, Ruolo, Stato ... */}
            </Card.Body>
          </Card>

          {/* Blocco 2: Azioni Rapide */}
          <Card className='shadow-sm'>
            <Card.Header as='h5'>Azioni Rapide</Card.Header>
            <Card.Body>
              <p>
                Vai a <a href='/prodotti/me'>I Miei Prodotti</a>
              </p>
              {/* Qui andrebbe il bottone per disattivare l'account (DELETE /utenti/me) */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
