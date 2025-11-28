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

// Endpoint per le risorse
const publicUserEndpoint = 'http://localhost:8888/utenti';
const publicProductsEndpoint = 'http://localhost:8888/prodotti/utente';
const myProductsEndpoint = 'http://localhost:8888/prodotti/me';
const ratingEndpoint = 'http://localhost:8888/utenti';
const addressesEndpoint = 'http://localhost:8888/indirizzi';

const brandColor = '#fa8229';
const brandHoverFill = '#fff3e0';

function ProfilePage() {
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = localStorage.getItem('accessToken');

  const { userId } = useParams();

  // Stati Utente e caricamento
  const [userToDisplay, setUserToDisplay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati Contenuto (Annunci o Recensioni)
  const [activeView, setActiveView] = useState('annunci');
  const [productsToDisplay, setProductsToDisplay] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Stati Rating
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoadingRating, setIsLoadingRating] = useState(false);

  // Stato per gli indirizzi (solo per il profilo privato)
  const [myAddresses, setMyAddresses] = useState([]);

  // STATI HOVER PER BOTTONI UI
  const [hoverModifica, setHoverModifica] = useState(false);
  const [hoverAnnunci, setHoverAnnunci] = useState(false);
  const [hoverRecensioni, setHoverRecensioni] = useState(false);

  // Determina se l'utente sta visualizzando il proprio profilo
  const isViewingOwnProfile =
    !userId || (currentUser && currentUser.id === userId);

  // 1. FETCH RATING
  /**
   * Recupera il rating medio e il conteggio delle recensioni per un dato utente.
   */
  const fetchRating = useCallback(async (targetUserId) => {
    setIsLoadingRating(true);
    try {
      const res = await fetch(`${ratingEndpoint}/${targetUserId}/rating`);
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
  /**
   * Recupera gli annunci dell'utente da visualizzare.
   */
  const fetchProducts = useCallback(
    async (targetUserId) => {
      setIsLoadingProducts(true);
      let endpoint;
      let headers = {};

      // Se visualizzo il mio profilo
      if (isViewingOwnProfile) {
        endpoint = myProductsEndpoint;
        headers = { Authorization: `Bearer ${token}` };
      }
      // Se visualizzo un profilo pubblico
      else if (targetUserId) {
        endpoint = `${publicProductsEndpoint}/${targetUserId}`;
      } else {
        setIsLoadingProducts(false);
        return;
      }

      try {
        const res = await fetch(endpoint, { method: 'GET', headers: headers });
        if (!res.ok) throw new Error('Errore prodotti');
        const data = await res.json();
        // L'API del proprio profilo ritorna un array, quella pubblica un oggetto con 'content'
        setProductsToDisplay(data.content || data);
      } catch (err) {
        console.error('Errore prodotti:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [isViewingOwnProfile, token]
  );

  // 3. FETCH INDIRIZZI (SOLO PER PROFILO PRIVATO)
  useEffect(() => {
    if (isViewingOwnProfile && token) {
      fetch(addressesEndpoint, {
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
    // Caso 1: Visualizzo il mio profilo
    if (isViewingOwnProfile && currentUser) {
      setUserToDisplay(currentUser);
      setIsLoading(false);
      return;
    }

    // Caso 2: Visualizzo un profilo pubblico tramite userId
    if (userId) {
      setIsLoading(true);
      setError(null);
      fetch(`${publicUserEndpoint}/${userId}`, {
        // Aggiungo il token se disponibile (per sicurezza)
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
      // Caso 3: userId non definito e non sono loggato (bloccato dal controllo iniziale)
      setIsLoading(false);
    }
  }, [userId, currentUser, isViewingOwnProfile, token]);

  // 5. CARICAMENTO DATI DIPENDENTI (Rating e Annunci)
  useEffect(() => {
    if (userToDisplay) {
      fetchRating(userToDisplay.id);

      if (activeView === 'annunci') {
        // Ricarico gli annunci solo se non sono già stati caricati per l'utente corretto
        const isDataStale =
          productsToDisplay.length === 0 ||
          productsToDisplay[0]?.venditore?.id !== userToDisplay.id;

        if (isDataStale) fetchProducts(userToDisplay.id);
      }
    }
    // L'array di dipendenze deve includere le funzioni definite tramite useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToDisplay, activeView, fetchProducts, fetchRating]);

  // FUNZIONE PER CALCOLARE LO STILE DEL BOTTONE IN BASE ALLO STATO
  const getButtonStyle = (isActive, isHovering) => {
    if (isActive) {
      // Stile Attivo (Arancione Pieno)
      return {
        backgroundColor: brandColor,
        borderColor: brandColor,
        color: 'white',
        opacity: isHovering ? 0.9 : 1,
      };
    } else {
      // Stile Inattivo (Outline Arancione)
      return {
        borderColor: brandColor,
        color: brandColor,
        backgroundColor: isHovering ? brandHoverFill : 'transparent',
      };
    }
  };

  // Controlli di stato preliminari
  if (!isAuthenticated && !userId) {
    return (
      <Container className='mt-5'>
        <Alert variant='warning'>
          Accesso negato. Effettua il login o specifica un ID utente.
        </Alert>
      </Container>
    );
  }

  if (isLoading || (isViewingOwnProfile && !userToDisplay)) {
    return <LoadingSpinner />;
  }

  if (error || !userToDisplay) {
    return (
      <Container className='mt-5'>
        <Alert variant='danger'>
          {error || 'Impossibile caricare il profilo.'}
        </Alert>
      </Container>
    );
  }

  const user = userToDisplay;
  const profileTitle = user.username;

  // Logica per determinare l'indirizzo principale da mostrare
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

  // Logica Avatar
  const hasValidAvatar =
    user.avatarUrl && user.avatarUrl !== 'default' && user.avatarUrl !== '';
  const displayAvatarUrl = hasValidAvatar ? user.avatarUrl : avatarDefault;

  return (
    <Container className='my-5'>
      <BackButton />

      <Row className='mb-4 justify-content-md-center'>
        {/* COLONNA AVATAR */}
        <Col
          xs={12}
          md='auto' // La colonna si restringe al contenuto (avatar)
          className='d-flex justify-content-center justify-content-md-start mb-4 mb-md-0'
        >
          <div className=''>
            <img
              src={displayAvatarUrl}
              alt={`${user.username} Avatar`}
              className='rounded-circle border-0 avatar-responsive'
            />
          </div>
        </Col>

        {/* COLONNA DETTAGLI */}
        <Col xs={12} md={true} className='ps-md-4'>
          <Row className='align-items-center'>
            {/* USERNAME E RATING */}
            <Col xs={12} md={8}>
              <div className='mt-2 mt-md-4'>
                <h1 className='fw-bold mb-0 fs-2 fs-md-1'>{profileTitle}</h1>

                {/* Rating e conteggio recensioni */}
                <div className='d-flex align-items-center mt-1'>
                  {isLoadingRating ? (
                    <Spinner
                      animation='border'
                      size='sm'
                      style={{ color: brandColor }}
                    />
                  ) : reviewCount > 0 ? (
                    <>
                      {/* Stelle piene/vuote basate sul rating medio */}
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

            {/* MODIFICA PROFILO BUTTON (visibile solo se proprio profilo) */}
            {isViewingOwnProfile && (
              <Col
                xs={12}
                md={4}
                className='d-flex justify-content-start justify-content-md-end mt-3 mt-md-0'
              >
                <Button
                  as={Link}
                  to='/profilo/gestione'
                  onMouseEnter={() => setHoverModifica(true)}
                  onMouseLeave={() => setHoverModifica(false)}
                  // Applica lo stile custom al bottone
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
                    style={{ color: brandColor }}
                  />
                  {/* Città e Nazione */}
                  <span className='fs-7-custom fs-md-6'>{cityAndCountry}</span>
                </li>
              </ul>
            </Col>
          </Row>
        </Col>
      </Row>

      <hr />

      {/* SELEZIONE VISTA (Annunci / Recensioni) */}
      <Row className='mb-5'>
        <Col xs={12} className='d-flex gap-2 flex-wrap'>
          {/* Bottone Annunci */}
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

          {/* Bottone Recensioni */}
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

      {/* CONTENUTO DINAMICO */}
      <Row>
        <Col md={12}>
          {/* Vista Recensioni */}
          {activeView === 'recensioni' && <RecensioniList utenteId={user.id} />}

          {/* Vista Annunci */}
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
                // Griglia dei prodotti
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
