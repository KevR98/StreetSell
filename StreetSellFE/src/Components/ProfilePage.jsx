import { useEffect, useState } from 'react'; // 🛑 Aggiunto useState e useEffect
import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; // 🛑 NUOVO IMPORT
import RecensioniList from './RecensioniList';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';

// 🛑 Definizione dell'endpoint
const endpointUtenti = 'http://localhost:8888/utenti';

function ProfilePage() {
  // Dati dell'utente loggato (usati per l'ID e l'autorizzazione)
  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  // 🛑 Estrae l'ID dall'URL. Se siamo su /utenti/XYZ, userId sarà XYZ.
  const { userId } = useParams();

  // 🛑 Stati per l'utente da visualizzare
  const [fetchedUser, setFetchedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determina quale ID usare per il fetch:
  // 1. Se l'URL ha un ID (es. /utenti/XYZ), usa quello.
  // 2. Altrimenti (siamo su /profilo o rotta generica), usa l'ID dell'utente loggato.
  const idToFetch = userId || (currentUser ? currentUser.id : null);

  useEffect(() => {
    // Esci se non c'è un ID valido da caricare
    if (!idToFetch || !token) {
      setIsLoading(false);
      // Se non siamo autenticati E non c'è ID nell'URL, mostriamo errore
      if (!currentUser)
        setError('Autenticazione richiesta o ID utente non specificato.');
      return;
    }

    // Se l'ID da caricare è l'ID dell'utente loggato, possiamo usare i dati di Redux
    // per evitare un fetch non necessario (se i dati di Redux sono completi e freschi).
    // Tuttavia, per garantire che i dati siano freschi e completi (es. se l'admin ha modificato l'utente),
    // è più sicuro eseguire sempre il fetch.

    setIsLoading(true);
    setError(null);

    // 🛑 Esegue il fetch per l'utente con l'ID dinamico
    fetch(`${endpointUtenti}/${idToFetch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Impossibile caricare il profilo utente.');
        return res.json();
      })
      .then((data) => {
        setFetchedUser(data); // Imposta l'utente che verrà visualizzato
      })
      .catch((err) => {
        console.error('Errore fetch utente:', err);
        setError('Errore nel caricamento dei dati utente.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [idToFetch, token, currentUser]); // Dipendenze aggiornate

  // 🛑 L'oggetto da usare per il rendering è quello scaricato
  const userToDisplay = fetchedUser;

  if (isLoading) return <LoadingSpinner />;

  if (error || !userToDisplay) {
    return (
      <Container className='mt-5'>
        <Alert variant='danger'>{error || 'Utente non trovato.'}</Alert>
      </Container>
    );
  }

  // --- RENDERING ---
  return (
    <Container className='my-5'>
      <BackButton />

      {/* 🛑 Usa userToDisplay per il nome */}
      <h1 className='mb-4'>
        {userId
          ? `Profilo Venditore: ${userToDisplay.username}`
          : `👋 Benvenuto nel Tuo Profilo, ${userToDisplay.username}`}
      </h1>

      <Row>
        <Col md={8}>
          {/* Passa l'ID dell'utente visualizzato per le recensioni */}
          <RecensioniList utenteId={userToDisplay.id} />
        </Col>

        <Col md={4}>
          <Card className='shadow-sm mb-4'>
            <Card.Header as='h5' className='bg-primary text-white'>
              Dettagli Account
            </Card.Header>
            <Card.Body>
              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  ID Utente:
                </Col>
                <Col xs={8} className='text-break'>
                  {userToDisplay.id} {/* 🛑 Usa userToDisplay */}
                </Col>
              </Row>
              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  Email:
                </Col>
                <Col xs={8} className='text-break'>
                  {userToDisplay.email} {/* 🛑 Usa userToDisplay */}
                </Col>
              </Row>
              {/* Continua ad usare userToDisplay per tutti i campi */}
            </Card.Body>
          </Card>

          {/* Azioni Rapide (Le modifichi in base a chi è loggato e chi è visualizzato) */}
          <Card className='shadow-sm'>
            <Card.Header as='h5'>Azioni Rapide</Card.Header>
            <Card.Body>
              {/* Mostra questo solo se l'utente loggato sta guardando il PROPRIO profilo */}
              {userToDisplay.id === currentUser?.id && (
                <p>
                  Vai a <a href='/prodotti/me'>I Miei Prodotti</a>
                </p>
              )}

              {/* Aggiungi qui la logica per "Contatta Venditore" se è un profilo esterno */}
              {userToDisplay.id !== currentUser?.id && (
                <Button variant='success'>
                  Contatta {userToDisplay.username}
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
