import { Alert, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import RecensioniList from './RecensioniList';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';
import { Link, useParams } from 'react-router-dom'; // 🛑 AGGIUNTI: useParams
import { useEffect, useState } from 'react'; // 🛑 AGGIUNTI: useEffect, useState

// 🛑 ENDPOINT PUBBLICO per recuperare i dati utente
const PUBLIC_USER_ENDPOINT = 'http://localhost:8888/utenti';

function ProfilePage() {
  // Dati Utente Loggato da Redux
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Dati Utente dall'URL
  const { userId } = useParams(); // 🛑 Ottiene l'ID se presente nell'URL (/utenti/:userId)

  // Stato per l'utente da visualizzare
  const [userToDisplay, setUserToDisplay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Variabile chiave: sto guardando il MIO profilo?
  // Vero se: la rotta è /me (userId è undefined) OPPURE l'ID nell'URL è il mio
  const isViewingOwnProfile =
    !userId || (currentUser && currentUser.id === userId);

  // Logica di Fetch
  useEffect(() => {
    // 1. Caso Privato (/me): Usa i dati già caricati da Redux
    if (isViewingOwnProfile && currentUser) {
      setUserToDisplay(currentUser);
      setIsLoading(false);
      return;
    }

    // 2. Caso Pubblico (/utenti/:userId): Fetch dei dati
    if (userId) {
      setIsLoading(true);
      setError(null);

      fetch(`${PUBLIC_USER_ENDPOINT}/${userId}`)
        .then((res) => {
          if (res.status === 404) throw new Error('Utente non trovato.');
          if (!res.ok)
            throw new Error('Errore nel caricamento del profilo utente.');
          return res.json();
        })
        .then((data) => {
          setUserToDisplay(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Errore fetch utente pubblico:', err);
          setError(err.message);
          setIsLoading(false);
        });
    } else {
      // Fallback per /me se currentUser non è ancora caricato (gestito dai controlli successivi)
      setIsLoading(false);
    }
  }, [userId, currentUser, isViewingOwnProfile]);

  // Controlli di stato

  if (!isAuthenticated && !userId) {
    return (
      <Container className='mt-5'>
        <Alert variant='warning'>
          Accesso negato. Effettua il <a href='/login'>login</a> per
          visualizzare il tuo profilo.
        </Alert>
      </Container>
    );
  }

  if (isLoading || (isViewingOwnProfile && !userToDisplay && isAuthenticated)) {
    return <LoadingSpinner />;
  }

  if (error || !userToDisplay) {
    return (
      <Container className='mt-5'>
        <Alert variant='danger'>
          {error || 'Impossibile caricare il profilo richiesto.'}
        </Alert>
      </Container>
    );
  }

  // Assegna l'utente da visualizzare
  const user = userToDisplay;

  const profileTitle = isViewingOwnProfile
    ? `👋 Benvenuto nel Tuo Profilo, ${user.username}`
    : `Profilo Pubblico di ${user.username}`;

  const cardHeaderTitle = isViewingOwnProfile
    ? 'Dettagli Account'
    : 'Info Venditore';

  return (
    <Container className='my-5'>
      <BackButton />
      <h1 className='mb-4'>{profileTitle}</h1>
      <Row>
        {/* ======================================================= */}
        {/* COLONNA 1 (md=8): RECENSIONI RICEVUTE (Contenuto principale) */}
        {/* ======================================================= */}
        <Col md={8}>
          {/* 🛑 Passa l'ID dell'utente da visualizzare */}
          <RecensioniList utenteId={user.id} />
        </Col>

        {/* ======================================================= */}
        {/* COLONNA 2 (md=4): DETTAGLI UTENTE E AZIONI RAPIDE */}
        {/* ======================================================= */}
        <Col md={4}>
          {/* Blocco 1: Dettagli Utente (Spostato qui) */}
          <Card className='shadow-sm mb-4'>
            {/* 🛑 Titolo dinamico per distinguere privato/pubblico */}
            <Card.Header as='h5' className='bg-primary text-white'>
              {cardHeaderTitle}
            </Card.Header>
            <Card.Body>
              {/* ID Utente - Visibile solo nel proprio profilo */}
              {isViewingOwnProfile && (
                <Row className='mb-3'>
                  <Col xs={4} className='fw-bold'>
                    ID Utente:
                  </Col>
                  <Col xs={8} className='text-break'>
                    {user.id}
                  </Col>
                </Row>
              )}

              <Row className='mb-3'>
                <Col xs={4} className='fw-bold'>
                  Username:
                </Col>
                <Col xs={8}>{user.username}</Col>
              </Row>

              {/* Email, Ruolo e Stato - Visibili solo nel proprio profilo */}
              {isViewingOwnProfile && (
                <>
                  <Row className='mb-3'>
                    <Col xs={4} className='fw-bold'>
                      Email:
                    </Col>
                    <Col xs={8} className='text-break'>
                      {user.email}
                    </Col>
                  </Row>
                  <Row className='mb-3'>
                    <Col xs={4} className='fw-bold'>
                      Ruolo:
                    </Col>
                    <Col xs={8}>{user.ruolo}</Col>
                  </Row>
                  <Row>
                    <Col xs={4} className='fw-bold'>
                      Stato:
                    </Col>
                    <Col xs={8}>{user.statoAccount}</Col>
                  </Row>
                </>
              )}
              {/* Messaggio per profilo pubblico */}
              {!isViewingOwnProfile && (
                <p className='text-muted small mt-3'>
                  Per questioni di privacy, i dati di contatto non sono visibili
                  pubblicamente.
                </p>
              )}
            </Card.Body>
          </Card>

          {/* Blocco 2: Azioni Rapide (Visibile solo nel proprio profilo) */}
          {isViewingOwnProfile && (
            <Card className='shadow-sm'>
              <Card.Header as='h5'>Azioni Rapide</Card.Header>
              <Card.Body>
                <p>
                  <Link to={`/prodotti/me`}>I Miei Prodotti in Vendita</Link>
                </p>

                <p>
                  <Link to={`/profilo/gestione`}>
                    ⚙️ Gestisci Dati e Indirizzi
                  </Link>
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
