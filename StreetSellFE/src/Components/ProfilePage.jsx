import {
  Alert,
  Card,
  Col,
  Container,
  Row,
  Spinner,
  Button,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import RecensioniList from './RecensioniList';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  FaMapMarkerAlt,
  FaEnvelopeOpenText,
  FaPen,
  FaCheckCircle,
} from 'react-icons/fa'; // Icone
import { BsBoxSeamFill, BsStarHalf } from 'react-icons/bs'; // Icone
import ProductCard from './ProductCard';

// Endpoint pubblico per recuperare i dati utente
const PUBLIC_USER_ENDPOINT = 'http://localhost:8888/utenti';

// 🛑 ENDPOINT PRODOTTI MIEI (usato precedentemente in ProfileProductPage.jsx)
const MY_PRODUCTS_ENDPOINT = 'http://localhost:8888/prodotti/me';

function ProfilePage() {
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = localStorage.getItem('accessToken');

  const { userId } = useParams();

  // 🛑 STATI PRINCIPALI PER L'UTENTE
  const [userToDisplay, setUserToDisplay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🛑 STATI PER IL CONTENUTO DINAMICO
  // 🛑 MODIFICATO QUI: Imposta 'annunci' come vista predefinita
  const [activeView, setActiveView] = useState('annunci');
  const [myProducts, setMyProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const isViewingOwnProfile =
    !userId || (currentUser && currentUser.id === userId);

  // 🛑 LOGICA FETCH PROFILO (Pubblico/Privato)
  useEffect(() => {
    // 1. Caso Privato: Usa i dati da Redux
    if (isViewingOwnProfile && currentUser) {
      setUserToDisplay(currentUser);
      setIsLoading(false);
      return;
    }

    // 2. Caso Pubblico: Fetch da API
    if (userId) {
      setIsLoading(true);
      setError(null);
      fetch(`${PUBLIC_USER_ENDPOINT}/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
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
      setIsLoading(false);
    }
  }, [userId, currentUser, isViewingOwnProfile, token]);

  // 🛑 FUNZIONE FETCH PRODOTTI PERSONALI
  const fetchMyProducts = () => {
    if (!token) return;

    setIsLoadingProducts(true);
    fetch(MY_PRODUCTS_ENDPOINT, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Errore nel caricamento dei prodotti.');
      })
      .then((data) => {
        // Assumo che il BE restituisca un oggetto Page con campo 'content' o l'array diretto
        setMyProducts(data.content || data);
      })
      .catch((err) => {
        console.error(err);
        // In un contesto reale, dovresti gestire l'errore qui
      })
      .finally(() => setIsLoadingProducts(false));
  };

  // 🛑 EFFETTO PER PRE-CARICARE I PRODOTTI AL CAMBIO DI VISTA O AL CARICAMENTO INIZIALE
  useEffect(() => {
    // Carica i prodotti solo quando l'utente è sul proprio profilo e ha selezionato 'annunci'
    if (isViewingOwnProfile && activeView === 'annunci' && !myProducts.length) {
      fetchMyProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewingOwnProfile, activeView]);

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

  const user = userToDisplay;

  // LOGICA DATI INDIRIZZO (Solo per il profilo privato)
  const mainAddress =
    user.indirizzi?.find((addr) => addr.principale === true) ||
    user.indirizzi?.[0];
  const cityAndCountry = mainAddress
    ? `${mainAddress.citta}, ${mainAddress.nazione}`
    : 'Nessun indirizzo principale';

  const profileTitle = isViewingOwnProfile
    ? user.username
    : `Profilo Pubblico di ${user.username}`;

  return (
    <Container className='my-5'>
      <BackButton />

      {/* ======================================================= */}
      {/* SEZIONE SUPERIORE: INFORMAZIONI GENERALI E MODIFICA */}
      {/* ======================================================= */}
      <Row className='mb-5'>
        <Col xs={12} md={8}>
          <h1 className='fw-bold mb-0'>{profileTitle}</h1>
          <p className='text-muted'>Nessuna recensione</p>
        </Col>

        {/* Bottone Modifica Visibile solo sul proprio profilo */}
        {isViewingOwnProfile && (
          <Col
            xs={12}
            md={4}
            className='d-flex justify-content-start justify-content-md-end mt-3 mt-md-0'
          >
            <Button
              variant='outline-secondary'
              as={Link}
              to='/profilo/gestione'
            >
              <FaPen className='me-2' /> Modifica Profilo
            </Button>
          </Col>
        )}

        {/* BLOCCO INFORMAZIONI (Solo su profilo privato) */}
        {isViewingOwnProfile && (
          <Col xs={12} className='mt-4'>
            <Row>
              <Col xs={12} md={6}>
                <h5 className='fw-bold mb-3'>Informazioni:</h5>
                <ul className='list-unstyled small'>
                  <li>
                    <FaMapMarkerAlt className='me-2 text-primary' />
                    {cityAndCountry}
                  </li>
                </ul>
              </Col>

              <Col xs={12} md={6}>
                <h5 className='fw-bold mb-3'>Informazioni verificate:</h5>
                <ul className='list-unstyled small'>
                  <li>
                    <FaCheckCircle className='me-2 text-success' /> Google
                  </li>
                  <li>
                    <FaEnvelopeOpenText className='me-2 text-success' /> E-mail
                  </li>
                </ul>
              </Col>
            </Row>
          </Col>
        )}
      </Row>

      <hr />

      {/* ======================================================= */}
      {/* 🛑 SEZIONE BOTTONI DI NAVIGAZIONE E CONTENUTO DINAMICO */}
      {/* ======================================================= */}
      <Row className='mb-5'>
        <Col xs={12} className='d-flex gap-3'>
          {/* 1. Bottone ANNUNCI IN CORSO */}
          {isViewingOwnProfile && (
            <Button
              variant={
                activeView === 'annunci' ? 'primary' : 'outline-secondary'
              }
              onClick={() => {
                setActiveView('annunci');
                // Se non li abbiamo ancora caricati, carichiamo ora
                if (!myProducts.length) fetchMyProducts();
              }}
            >
              <BsBoxSeamFill className='me-2' /> I Miei Annunci in Corso
              {isLoadingProducts && (
                <Spinner animation='border' size='sm' className='ms-2' />
              )}
            </Button>
          )}

          {/* 2. Bottone RECENSIONI */}
          <Button
            variant={
              activeView === 'recensioni' ? 'primary' : 'outline-secondary'
            }
            onClick={() => setActiveView('recensioni')}
          >
            <BsStarHalf className='me-2' /> Recensioni Ricevute
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          {/* 🛑 VISUALIZZAZIONE CONTENUTO (Recensioni o Annunci) */}

          {/* 1. Recensioni (Solo se activeView è 'recensioni' O se è un profilo PUBBLICO) */}
          {activeView === 'recensioni' && <RecensioniList utenteId={user.id} />}

          {/* 2. Annunci in Corso (Solo per il proprio profilo e se selezionato) */}
          {activeView === 'annunci' && isViewingOwnProfile && (
            <div id='my-products-list'>
              <h2 className='mb-4'>I Miei Annunci Attivi</h2>
              {isLoadingProducts ? (
                <LoadingSpinner />
              ) : myProducts.length === 0 ? (
                <Alert variant='info'>
                  Non hai prodotti attivi in vendita.
                </Alert>
              ) : (
                // Rendering della lista prodotti (Logica da ProfileProductPage.jsx)
                <Row xs={1} md={2} lg={3} className='g-4'>
                  {myProducts.map((prodotto) => (
                    <Col key={prodotto.id}>
                      <ProductCard prodotto={prodotto} />
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
