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
import { useEffect, useState, useCallback } from 'react';
import {
  FaMapMarkerAlt,
  FaEnvelopeOpenText,
  FaPen,
  FaCheckCircle,
  FaStar,
} from 'react-icons/fa';
import { BsBoxSeamFill, BsStarHalf } from 'react-icons/bs';
import ProductCard from './ProductCard';

// Endpoint pubblico per recuperare i dati utente
const PUBLIC_USER_ENDPOINT = 'http://localhost:8888/utenti';

// Endpoint per i prodotti
const PUBLIC_PRODUCTS_ENDPOINT = 'http://localhost:8888/prodotti/utente';
const MY_PRODUCTS_ENDPOINT = 'http://localhost:8888/prodotti/me';

// Endpoint per il rating
const RATING_ENDPOINT = 'http://localhost:8888/utenti';

// 🛑 NUOVO ENDPOINT INDIRIZZI
const ADDRESSES_ENDPOINT = 'http://localhost:8888/indirizzi';

function ProfilePage() {
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = localStorage.getItem('accessToken');

  const { userId } = useParams();

  // Stati Utente
  const [userToDisplay, setUserToDisplay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati Contenuto
  const [activeView, setActiveView] = useState('annunci');
  const [productsToDisplay, setProductsToDisplay] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Stati Rating
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoadingRating, setIsLoadingRating] = useState(false);

  // 🛑 NUOVO STATO PER GLI INDIRIZZI (Specifico per il profilo privato)
  const [myAddresses, setMyAddresses] = useState([]);

  const isViewingOwnProfile =
    !userId || (currentUser && currentUser.id === userId);

  // 1. FETCH RATING
  const fetchRating = useCallback(async (targetUserId) => {
    setIsLoadingRating(true);
    try {
      const res = await fetch(`${RATING_ENDPOINT}/${targetUserId}/rating`);
      if (!res.ok) throw new Error('Errore rating');
      const data = await res.json();
      setAverageRating(data.averageRating || 0);
      setReviewCount(data.reviewCount || 0);
    } catch (error) {
      console.error('Errore rating:', error);
    } finally {
      setIsLoadingRating(false);
    }
  }, []);

  // 2. FETCH PRODOTTI
  const fetchProducts = useCallback(
    async (targetUserId) => {
      setIsLoadingProducts(true);
      let endpoint;
      let headers = {};

      if (isViewingOwnProfile) {
        endpoint = MY_PRODUCTS_ENDPOINT;
        headers = { Authorization: `Bearer ${token}` };
      } else if (targetUserId) {
        endpoint = `${PUBLIC_PRODUCTS_ENDPOINT}/${targetUserId}`;
      } else {
        setIsLoadingProducts(false);
        return;
      }

      try {
        const res = await fetch(endpoint, { method: 'GET', headers: headers });
        if (!res.ok) throw new Error('Errore prodotti');
        const data = await res.json();
        setProductsToDisplay(data.content || data);
      } catch (err) {
        console.error('Errore prodotti:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [isViewingOwnProfile, token]
  );

  // 🛑 3. FETCH INDIRIZZI (SOLO PER PROFILO PRIVATO)
  // Serve perché currentUser di Redux spesso non ha la lista indirizzi
  useEffect(() => {
    if (isViewingOwnProfile && token) {
      fetch(ADDRESSES_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Errore fetch indirizzi');
        })
        .then((data) => {
          setMyAddresses(data);
        })
        .catch((err) => console.error('Impossibile caricare indirizzi:', err));
    }
  }, [isViewingOwnProfile, token]);

  // 4. LOGICA FETCH PROFILO GENERALE
  useEffect(() => {
    // Caso Privato: Usa i dati da Redux
    if (isViewingOwnProfile && currentUser) {
      setUserToDisplay(currentUser);
      setIsLoading(false);
      return;
    }

    // Caso Pubblico: Fetch da API
    if (userId) {
      setIsLoading(true);
      setError(null);
      fetch(`${PUBLIC_USER_ENDPOINT}/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Errore profilo');
          return res.json();
        })
        .then((data) => {
          setUserToDisplay(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [userId, currentUser, isViewingOwnProfile, token]);

  // 5. CARICAMENTO DATI DIPENDENTI (Rating e Prodotti)
  useEffect(() => {
    if (userToDisplay) {
      fetchRating(userToDisplay.id);
      if (activeView === 'annunci') {
        const isDataStale =
          productsToDisplay.length === 0 ||
          productsToDisplay[0]?.venditore?.id !== userToDisplay.id;
        if (isDataStale) fetchProducts(userToDisplay.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToDisplay, activeView, fetchProducts, fetchRating]);

  // Controlli di stato
  if (!isAuthenticated && !userId) {
    return (
      <Container className='mt-5'>
        <Alert variant='warning'>Accesso negato.</Alert>
      </Container>
    );
  }

  if (isLoading || (isViewingOwnProfile && !userToDisplay)) {
    return <LoadingSpinner />;
  }

  if (error || !userToDisplay) {
    return (
      <Container className='mt-5'>
        <Alert variant='danger'>{error || 'Errore profilo.'}</Alert>
      </Container>
    );
  }

  const user = userToDisplay;
  const profileTitle = isViewingOwnProfile ? user.username : user.username;

  // =========================================================================
  // 🛑 LOGICA CALCOLO INDIRIZZO CORRETTA
  // =========================================================================

  // Se è il mio profilo, uso 'myAddresses' caricato appositamente.
  // Se è pubblico, uso 'user.indirizzi' (se il backend pubblico li fornisce).
  const addressList = isViewingOwnProfile ? myAddresses : user.indirizzi || [];

  const mainAddress =
    addressList.find((addr) => addr.principale === true) || addressList[0];

  let locationFallback;
  if (isViewingOwnProfile) {
    locationFallback = 'Nessun indirizzo impostato. Vai a Modifica Profilo.';
  } else {
    locationFallback = 'Posizione non specificata pubblicamente.';
  }

  const cityAndCountry = mainAddress
    ? `${mainAddress.citta}, ${mainAddress.nazione}`
    : locationFallback;

  // =========================================================================

  return (
    <Container className='my-5'>
      <BackButton />

      <Row className='mb-5'>
        <Col xs={12} md={8}>
          <h1 className='fw-bold mb-0'>{profileTitle}</h1>

          <div className='d-flex align-items-center mt-1'>
            {isLoadingRating ? (
              <Spinner animation='border' size='sm' className='text-primary' />
            ) : reviewCount > 0 ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    size={18}
                    color={
                      i < Math.round(averageRating) ? '#ffc107' : '#e4e5e9'
                    }
                    className='me-1'
                  />
                ))}
                <span className='ms-2 small text-muted'>
                  ({averageRating.toFixed(1)}/5) - {reviewCount} recensioni
                </span>
              </>
            ) : (
              <p className='text-muted small mb-0'>
                Nessuna recensione ancora.
              </p>
            )}
          </div>
        </Col>

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

        {/* 🛑 BLOCCO INFORMAZIONI CORRETTO */}
        <Col xs={12} className='mt-4'>
          <Row>
            <Col xs={12} md={6}>
              <h5 className='fw-bold mb-3'>Informazioni:</h5>
              <ul className='list-unstyled small'>
                <li className='d-flex align-items-center'>
                  <FaMapMarkerAlt className='me-2 text-primary' />
                  {/* Ora mostrerà città e nazione perché abbiamo fetchato gli indirizzi */}
                  <span>{cityAndCountry}</span>
                </li>
              </ul>
            </Col>

            <Col xs={12} md={6}>
              <h5 className='fw-bold mb-3'>Informazioni verificate:</h5>
              <ul className='list-unstyled small'>
                {isViewingOwnProfile ? (
                  <>
                    <li>
                      <FaCheckCircle className='me-2 text-success' /> Google
                    </li>
                    <li>
                      <FaEnvelopeOpenText className='me-2 text-success' />{' '}
                      E-mail
                    </li>
                  </>
                ) : (
                  <p className='text-muted small'>
                    Per privacy, le informazioni di verifica sono nascoste.
                  </p>
                )}
              </ul>
            </Col>
          </Row>
        </Col>
      </Row>

      <hr />

      <Row className='mb-5'>
        <Col xs={12} className='d-flex gap-3'>
          <Button
            variant={activeView === 'annunci' ? 'primary' : 'outline-secondary'}
            onClick={() => setActiveView('annunci')}
          >
            <BsBoxSeamFill className='me-2' /> Annunci in Vendita
            {isLoadingProducts && (
              <Spinner animation='border' size='sm' className='ms-2' />
            )}
          </Button>

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
          {activeView === 'recensioni' && <RecensioniList utenteId={user.id} />}

          {activeView === 'annunci' && (
            <div id='products-list'>
              <h2 className='mb-4'>
                {isViewingOwnProfile
                  ? 'I Miei Annunci Attivi'
                  : `Annunci di ${user.username}`}
              </h2>
              {isLoadingProducts ? (
                <LoadingSpinner />
              ) : productsToDisplay.length === 0 ? (
                <Alert variant='info'>
                  {isViewingOwnProfile
                    ? 'Non hai prodotti attivi in vendita.'
                    : `${user.username} non ha prodotti attivi in vendita.`}
                </Alert>
              ) : (
                <Row xs={1} md={2} lg={3} className='g-4'>
                  {productsToDisplay.map((prodotto) => (
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
