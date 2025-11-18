import { Alert, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';

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
    return (
      <Container className='mt-5 text-center'>
        <Spinner animation='border' role='status' />
        <p>Caricamento dati utente...</p>
      </Container>
    );
  }
  return (
    <Container className='my-5'>
      <h1 className='mb-4'>👋 Benvenuto nel Tuo Profilo, {user.username}</h1>
      <Row>
        <Col md={8}>
          <Card className='shadow-sm'>
            <Card.Header as='h5' className='bg-primary text-white'>
              Dettagli Utente
            </Card.Header>
            <Card.Body>
              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  ID Utente:
                </Col>
                <Col xs={8} className='text-break'>
                  {user.id}
                </Col>
              </Row>
              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  Username:
                </Col>
                <Col xs={8}>{user.username}</Col>
              </Row>
              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  Email:
                </Col>
                <Col xs={8}>{user.email}</Col>
              </Row>
              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  Ruolo:
                </Col>
                <Col xs={8}>{user.ruolo}</Col>
              </Row>
              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  Stato Account:
                </Col>
                <Col xs={8}>{user.isAttivo ? 'Attivo' : 'Disattivato'}</Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Colonna per le Azioni o i Prodotti Venduti */}
        <Col md={4}>
          <Card className='shadow-sm'>
            <Card.Header as='h5'>Azioni Rapide</Card.Header>
            <Card.Body>
              <p>
                Qui puoi aggiungere link per modificare il profilo o vedere i
                prodotti in vendita.
              </p>
              <p>
                Vai a <a href='/prodotti/me'>I Miei Prodotti</a>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
