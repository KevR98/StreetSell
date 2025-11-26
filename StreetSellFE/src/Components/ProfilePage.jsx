import { Alert, Col, Container, Row, Spinner, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import RecensioniList from './RecensioniList';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { FaMapMarkerAlt, FaPen, FaStar } from 'react-icons/fa';
import { BsBoxSeamFill, BsStarHalf } from 'react-icons/bs';
import ProductCard from './ProductCard';

import avatarDefault from '../assets/streetsell-profile-pic.png';

// Endpoint pubblico per recuperare i dati utente
const PUBLIC_USER_ENDPOINT = 'http://localhost:8888/utenti';

// Endpoint per i prodotti
const PUBLIC_PRODUCTS_ENDPOINT = 'http://localhost:8888/prodotti/utente';
const MY_PRODUCTS_ENDPOINT = 'http://localhost:8888/prodotti/me';

// Endpoint per il rating
const RATING_ENDPOINT = 'http://localhost:8888/utenti';

// NUOVO ENDPOINT INDIRIZZI
const ADDRESSES_ENDPOINT = 'http://localhost:8888/indirizzi';

const BRAND_COLOR = '#fa8229';
const BRAND_HOVER_FILL = '#fff3e0';

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

  const [myAddresses, setMyAddresses] = useState([]);

  // STATI HOVER PER BOTTONI
  const [hoverModifica, setHoverModifica] = useState(false);
  const [hoverAnnunci, setHoverAnnunci] = useState(false);
  const [hoverRecensioni, setHoverRecensioni] = useState(false);

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

  // FETCH PRODOTTI
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

  // FETCH INDIRIZZI (SOLO PER PROFILO PRIVATO)
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

  // LOGICA FETCH PROFILO GENERALE
  useEffect(() => {
    if (isViewingOwnProfile && currentUser) {
      setUserToDisplay(currentUser);
      setIsLoading(false);
      return;
    }

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

  // CARICAMENTO DATI DIPENDENTI
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

  // FUNZIONE PER CALCOLARE LO STILE DEL BOTTONE IN BASE ALLO STATO
  const getButtonStyle = (isActive, isHovering) => {
    if (isActive) {
      // Stile Attivo (Arancione Pieno)
      return {
        backgroundColor: BRAND_COLOR,
        borderColor: BRAND_COLOR,
        color: 'white',
        opacity: isHovering ? 0.9 : 1,
      };
    } else {
      // Stile Inattivo (Outline Arancione)
      return {
        borderColor: BRAND_COLOR,
        color: BRAND_COLOR,
        backgroundColor: isHovering ? BRAND_HOVER_FILL : 'transparent',
      };
    }
  };

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

  // CORREZIONE LOGICA AVATAR:
  const hasValidAvatar =
    user.avatarUrl && user.avatarUrl !== 'default' && user.avatarUrl !== '';
  const displayAvatarUrl = hasValidAvatar ? user.avatarUrl : avatarDefault;

  return (
    <Container className='my-5'>
      <BackButton />

      {/* ✅ MODIFICA LAYOUT PER 1440px: 
         - Aggiunto justify-content-md-center per centrare tutto il blocco se vuoi,
           oppure lascialo standard.
         - Usiamo gap-4 o gap-md-5 per gestire la distanza precisa tra avatar e testo
           senza dipendere dalla griglia larga.
      */}
      <Row className='mb-4 justify-content-md-center'>
        {/* ✅ COLONNA AVATAR: md="auto" 
            La colonna si restringe esattamente alla larghezza dell'immagine (200px).
            Niente più spazio vuoto enorme a destra dell'avatar.
        */}
        <Col
          xs={12}
          md='auto'
          className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0'
        >
          {/* ✅ RIMOSSO ms-lg-4 per evitare margine sinistro indesiderato */}
          <div className=''>
            <img
              src={displayAvatarUrl}
              alt={`${user.username} Avatar`}
              className='rounded-circle border-0 avatar-responsive'
            />
          </div>
        </Col>

        {/* ✅ COLONNA DETTAGLI: md={true} (o semplicemente Col)
            Prende tutto lo spazio rimanente subito dopo l'avatar.
            Aggiunto ps-md-4 per dare un po' di respiro (padding left) dall'avatar.
        */}
        <Col xs={12} md={true} className='ps-md-4'>
          <Row className='align-items-center'>
            {/* USERNAME E RATING */}
            <Col xs={12} md={8}>
              <div className='mt-2 mt-md-4'>
                <h1 className='fw-bold mb-0 fs-2 fs-md-1'>{profileTitle}</h1>

                <div className='d-flex align-items-center mt-1'>
                  {isLoadingRating ? (
                    <Spinner
                      animation='border'
                      size='sm'
                      style={{ color: BRAND_COLOR }}
                    />
                  ) : reviewCount > 0 ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={16}
                          color={
                            i < Math.round(averageRating)
                              ? '#ffc107'
                              : '#e4e5e9'
                          }
                          className='me-1'
                        />
                      ))}
                      <span className='ms-2 small text-muted fs-7-custom fs-md-6'>
                        ({averageRating.toFixed(1)}/5) - {reviewCount}{' '}
                        recensioni
                      </span>
                    </>
                  ) : (
                    <p className='text-muted small mb-0 fs-7-custom fs-md-6'>
                      Nessuna recensione ancora.
                    </p>
                  )}
                </div>
              </div>
            </Col>

            {/* MODIFICA PROFILO BUTTON */}
            {isViewingOwnProfile && (
              <Col
                xs={12}
                md={4} // Aumentato un po' lo spazio per il bottone
                className='d-flex justify-content-start justify-content-md-end mt-3 mt-md-0'
              >
                <Button
                  as={Link}
                  to='/profilo/gestione'
                  onMouseEnter={() => setHoverModifica(true)}
                  onMouseLeave={() => setHoverModifica(false)}
                  style={getButtonStyle(false, hoverModifica)}
                  size='sm'
                >
                  <FaPen className='me-2' /> Modifica Profilo
                </Button>
              </Col>
            )}
          </Row>

          {/* INFORMAZIONI DI BASE */}
          <Row className='mt-3 mt-md-4'>
            <Col xs={12} md={8}>
              <h5 className='fw-bold mb-2 mb-md-3 fs-6 fs-md-5'>
                Informazioni:
              </h5>
              <ul className='list-unstyled small'>
                <li className='d-flex align-items-center'>
                  <FaMapMarkerAlt
                    className='me-2'
                    style={{ color: BRAND_COLOR }}
                  />
                  <span className='fs-7-custom fs-md-6'>{cityAndCountry}</span>
                </li>
              </ul>
            </Col>
          </Row>
        </Col>
      </Row>

      <hr />

      <Row className='mb-5'>
        <Col xs={12} className='d-flex gap-2 flex-wrap'>
          <Button
            onClick={() => setActiveView('annunci')}
            onMouseEnter={() => setHoverAnnunci(true)}
            onMouseLeave={() => setHoverAnnunci(false)}
            style={getButtonStyle(activeView === 'annunci', hoverAnnunci)}
            size='sm'
          >
            <BsBoxSeamFill className='me-2' /> Annunci in Vendita
            {isLoadingProducts && (
              <Spinner animation='border' size='sm' className='ms-2' />
            )}
          </Button>

          <Button
            onClick={() => setActiveView('recensioni')}
            onMouseEnter={() => setHoverRecensioni(true)}
            onMouseLeave={() => setHoverRecensioni(false)}
            style={getButtonStyle(activeView === 'recensioni', hoverRecensioni)}
            size='sm'
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
              <h2 className='mb-4 fs-4 fs-md-3'>
                {isViewingOwnProfile
                  ? 'I Miei Annunci Attivi'
                  : `Annunci di ${user.username}`}
              </h2>
              {isLoadingProducts ? (
                <LoadingSpinner />
              ) : productsToDisplay.length === 0 ? (
                <Alert variant='info' className='fs-7-custom fs-md-6'>
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
