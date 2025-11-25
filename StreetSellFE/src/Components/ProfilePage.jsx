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

// ✅ RINOMINATO PER CHIAREZZA
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

// ✅ BRAND COLOR
const BRAND_COLOR = '#fa8229';
const BRAND_HOVER_FILL = '#fff3e0'; // Sfondo molto chiaro per l'effetto hover outline

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

  // ✅ STATI HOVER PER BOTTONI
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

  // ✅ FUNZIONE PER CALCOLARE LO STILE DEL BOTTONE IN BASE ALLO STATO
  const getButtonStyle = (isActive, isHovering) => {
    if (isActive) {
      // Stile Attivo (Arancione Pieno)
      return {
        backgroundColor: BRAND_COLOR,
        borderColor: BRAND_COLOR,
        color: 'white',
        // Hover per stato attivo (leggermente più scuro, opzionale)
        opacity: isHovering ? 0.9 : 1,
      };
    } else {
      // Stile Inattivo (Outline Arancione)
      return {
        borderColor: BRAND_COLOR,
        color: BRAND_COLOR,
        // Sfondo trasparente che viene sovrascritto dall'hover
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

  // ✅ CORREZIONE LOGICA AVATAR:
  const hasValidAvatar =
    user.avatarUrl && user.avatarUrl !== 'default' && user.avatarUrl !== '';
  const displayAvatarUrl = hasValidAvatar ? user.avatarUrl : avatarDefault;

  return (
    <Container className='my-5'>
      <BackButton />

      <Row className='mb-4'>
        {/* COLONNA AVATAR (md=3) */}
        <Col
          xs={12}
          md={3}
          className='d-flex justify-content-center justify-content-md-start mb-4'
        >
          <div className='ms-5'>
            <img
              src={displayAvatarUrl}
              alt={`${user.username} Avatar`}
              className='rounded-circle border-0'
              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
            />
          </div>
        </Col>

        {/* COLONNA DETTAGLI PRINCIPALI (md=9) */}
        <Col xs={12} md={8}>
          <Row className='align-items-center'>
            {/* USERNAME E RATING (md=8) */}
            <Col xs={12} md={8}>
              <div className='mt-4'>
                <h1 className='fw-bold mb-0'>{profileTitle}</h1>

                <div className='d-flex align-items-center mt-1'>
                  {isLoadingRating ? (
                    <Spinner
                      animation='border'
                      size='sm'
                      // ✅ BRAND COLOR SPINNER
                      style={{ color: BRAND_COLOR }}
                    />
                  ) : reviewCount > 0 ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={18}
                          color={
                            i < Math.round(averageRating)
                              ? '#ffc107' // Giallo standard per le stelle
                              : '#e4e5e9'
                          }
                          className='me-1'
                        />
                      ))}
                      <span className='ms-2 small text-muted'>
                        ({averageRating.toFixed(1)}/5) - {reviewCount}{' '}
                        recensioni
                      </span>
                    </>
                  ) : (
                    <p className='text-muted small mb-0'>
                      Nessuna recensione ancora.
                    </p>
                  )}
                </div>
              </div>
            </Col>

            {/* MODIFICA PROFILO BUTTON (md=4) */}
            {isViewingOwnProfile && (
              <Col
                xs={12}
                md={4}
                className='d-flex justify-content-start justify-content-md-end mt-3 mt-md-0'
              >
                <Button
                  // ✅ Tolgo variant per il controllo manuale
                  as={Link}
                  to='/profilo/gestione'
                  // ✅ Controllo Hover
                  onMouseEnter={() => setHoverModifica(true)}
                  onMouseLeave={() => setHoverModifica(false)}
                  style={getButtonStyle(false, hoverModifica)}
                >
                  <FaPen className='me-2' /> Modifica Profilo
                </Button>
              </Col>
            )}
          </Row>

          {/* INFORMAZIONI DI BASE (Sotto il Rating/Button) */}
          <Row className='mt-4'>
            <Col xs={12} md={6}>
              <h5 className='fw-bold mb-3'>Informazioni:</h5>
              <ul className='list-unstyled small'>
                <li className='d-flex align-items-center'>
                  {/* ✅ BRAND COLOR ICONA */}
                  <FaMapMarkerAlt
                    className='me-2'
                    style={{ color: BRAND_COLOR }}
                  />
                  <span>{cityAndCountry}</span>
                </li>
              </ul>
            </Col>
          </Row>
        </Col>
      </Row>

      <hr />

      <Row className='mb-5'>
        <Col xs={12} className='d-flex gap-3'>
          <Button
            onClick={() => setActiveView('annunci')}
            // ✅ Controllo Hover
            onMouseEnter={() => setHoverAnnunci(true)}
            onMouseLeave={() => setHoverAnnunci(false)}
            style={getButtonStyle(activeView === 'annunci', hoverAnnunci)}
          >
            <BsBoxSeamFill className='me-2' /> Annunci in Vendita
            {isLoadingProducts && (
              <Spinner animation='border' size='sm' className='ms-2' />
            )}
          </Button>

          <Button
            onClick={() => setActiveView('recensioni')}
            // ✅ Controllo Hover
            onMouseEnter={() => setHoverRecensioni(true)}
            onMouseLeave={() => setHoverRecensioni(false)}
            style={getButtonStyle(activeView === 'recensioni', hoverRecensioni)}
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
