import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Button,
  Carousel,
  Modal,
  Badge,
  Alert,
} from 'react-bootstrap';
import BackButton from './BackButton';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import Order from './Order';
import ProductCard from './ProductCard';

const brandColor = '#fa8229';

const endpoint = 'http://localhost:8888/prodotti';
const userProductsEndpoint = 'http://localhost:8888/prodotti/utente';

function Details() {
  const [prodotto, setProdotto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { prodottoId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const [otherProducts, setOtherProducts] = useState([]);
  const [isLoadingOther, setIsLoadingOther] = useState(false);
  const [totalSellerProductsCount, setTotalSellerProductsCount] = useState(0);

  // Logica fetch
  const fetchOtherProducts = (sellerId) => {
    setIsLoadingOther(true);
    fetch(`${userProductsEndpoint}/${sellerId}`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 404) {
          return [];
        } else {
          throw new Error('Errore nel caricamento degli altri annunci.');
        }
      })
      .then((data) => {
        const rawData = Array.isArray(data) ? data : [];
        setTotalSellerProductsCount(rawData.length);
        const filteredData = rawData
          .filter((p) => p.id !== prodottoId)
          .slice(0, 4);

        setOtherProducts(filteredData);
      })
      .catch((err) => {
        console.error('Errore nel caricamento degli altri prodotti:', err);
        setOtherProducts([]);
        setTotalSellerProductsCount(0);
      })
      .finally(() => setIsLoadingOther(false));
  };

  useEffect(() => {
    fetch(endpoint + '/' + prodottoId)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Errore nel caricamento del prodotto');
        }
      })
      .then((prodottoDetail) => {
        setIsLoading(false);
        setError(false);
        setProdotto(prodottoDetail);

        if (prodottoDetail.venditore && prodottoDetail.venditore.id) {
          fetchOtherProducts(prodottoDetail.venditore.id);
        } else {
          setTotalSellerProductsCount(0);
        }
      })
      .catch((err) => {
        console.error('Errore nel caricamento:', err);
        setIsLoading(false);
        setError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prodottoId, token]);

  // Logica gestione eliminazione
  const handleDelete = () => {
    if (
      window.confirm(
        'Sei sicuro di voler eliminare definitivamente questo annuncio?'
      )
    ) {
      fetch(endpoint + '/' + prodottoId, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (res.ok) {
            alert('Prodotto eliminato con successo!');
            navigate('/prodotti/me');
          } else {
            alert("C'è stato un errore durante l'eliminazione.");
          }
        })
        .catch((err) => {
          console.error('Errore:', err);
          setIsLoading(false);
          setError(true);
        });
    }
  };

  // GESTIONE STATI DI CARICAMENTO/ERRORE
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message='Impossibile caricare il prodotto.' />;
  }

  if (!prodotto) {
    return (
      <Container className='text-center my-5'>
        Nessun prodotto da visualizzare.
      </Container>
    );
  }

  // Permessi
  const isOwner =
    currentUser &&
    prodotto.venditore &&
    currentUser.id === prodotto.venditore.id;

  const isAdmin = currentUser && currentUser.ruolo === 'ADMIN';

  const canModerate = isOwner || isAdmin;

  const canBuy =
    !isOwner && !isAdmin && prodotto.statoProdotto === 'DISPONIBILE';

  // Logica per le immagini
  const immaginiCarousel =
    prodotto.immagini && prodotto.immagini.length > 0
      ? prodotto.immagini
      : [
          {
            url: 'https://via.placeholder.com/600x400?text=Immagine+Non+Disponibile',
            id: 'placeholder-0',
          },
        ];

  const numeroImmagini = immaginiCarousel.length;

  // Funzioni per il Modal Carosello
  const handleShowModal = (index) => {
    setModalIndex(index);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  // Variabili per il layout della griglia
  const visibleImages = immaginiCarousel.slice(0, 3);
  const remainingImagesCount = numeroImmagini > 3 ? numeroImmagini - 3 : 0;

  const venditoreUsername = prodotto.venditore?.username || 'questo venditore';

  // Funzione per rendering Bottoni di Azione (Affiancati e Uniformi)
  const renderActionButtons = (isFixedMobile = false) => {
    const buttonClass = isFixedMobile ? 'btn-sm' : 'btn-lg';
    const fontClass = isFixedMobile ? 'fs-7-custom' : ''; // ✅ Classe Font Ridotta

    if (canModerate) {
      return (
        <div className={`d-flex gap-3 ${isFixedMobile ? 'w-100' : ''}`}>
          <Link
            to={`/modifica-prodotto/${prodotto.id}`}
            className={`btn btn-warning ${buttonClass} flex-grow-1 ${fontClass}`}
          >
            ✏️ Modifica Annuncio
          </Link>
          <Button
            variant='danger'
            size={buttonClass}
            className={`flex-grow-1 ${fontClass}`}
            onClick={handleDelete}
          >
            🗑️ Elimina Annuncio
          </Button>
        </div>
      );
    }

    if (canBuy) {
      return (
        <div className={`d-flex gap-2 ${isFixedMobile ? 'w-100' : ''}`}>
          {/* Order deve ricevere la classe per forzare l'uniformità (es. btn-sm) */}
          <Order
            prodottoId={prodotto.id}
            className={`flex-grow-1 ${buttonClass} ${fontClass}`}
          />
          <Button
            style={{
              color: brandColor,
              backgroundColor: 'transparent',
              borderColor: brandColor,
            }}
            size={buttonClass}
            className={`flex-grow-1 ${fontClass}`}
          >
            Fai un'offerta
          </Button>
        </div>
      );
    }

    if (!canBuy && !canModerate && !isFixedMobile) {
      return (
        <Button
          variant='secondary'
          size={buttonClass}
          className='w-100'
          disabled
        >
          Non Disponibile / Venduto
        </Button>
      );
    }

    return null;
  };

  return (
    <>
      {/* Contenitore principale */}
      <Container className='my-5 details-responsive-container'>
        <BackButton />

        <Row>
          {/* CAROUSEL MOBILE (Visibile solo su XS/SM) */}
          <Col xs={12} className='d-block d-md-none mb-3'>
            <Carousel
              activeIndex={modalIndex}
              onSelect={setModalIndex}
              interval={null}
              touch={true}
              controls={true}
              indicators={true}
              className='mobile-carousel-height'
            >
              {immaginiCarousel.map((img, index) => (
                <Carousel.Item key={img.id || index}>
                  <img
                    className='d-block w-100'
                    src={img.url}
                    alt={`${prodotto.titolo} - ${index}`}
                    onClick={() => handleShowModal(index)}
                    style={{
                      objectFit: 'cover',
                      height: '100%',
                      borderRadius: '8px',
                    }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>

          {/* COLONNA 1 (md=6): GRIGLIA IMMAGINI (Visibile solo da MD in su) */}
          <Col md={6} className='d-none d-md-flex flex-column gap-2'>
            <div className='d-flex flex-wrap gap-2'>
              {visibleImages.map((img, index) => {
                const isLarge = index === 0;

                const wrapperClasses = isLarge
                  ? 'details-img-large'
                  : 'details-img-small';
                const sizeClasses = isLarge ? 'w-100' : 'w-100 w-md-50';

                const showOverlay = index === 2 && remainingImagesCount > 0;
                const clickHandler = () => handleShowModal(index);

                return (
                  <div
                    key={img.id || index}
                    className={`position-relative cursor-pointer ${wrapperClasses} ${sizeClasses}`}
                    onClick={clickHandler}
                    style={{ overflow: 'hidden', borderRadius: '8px' }}
                  >
                    <img
                      src={img.url}
                      alt={`${prodotto.titolo} - ${index}`}
                      className='w-100 h-100'
                      style={{ objectFit: 'cover' }}
                    />

                    {showOverlay && (
                      <div
                        className='position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center'
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          zIndex: 10,
                        }}
                      >
                        <Badge
                          bg='light'
                          text='dark'
                          className='fs-6 fs-md-5'
                          style={{
                            padding: '10px 15px',
                            opacity: 0.9,
                          }}
                        >
                          +{remainingImagesCount} altre
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Col>

          {/* COLONNA 2 (md=6): DETTAGLI */}
          <Col md={6} className='pt-4 pt-md-0'>
            {/* TITOLO E PREZZO */}
            <h3 className='mb-2 fw-bold fs-3 fs-md-1'>{prodotto.titolo}</h3>
            <p
              className='fw-bold mb-3 fs-4 fs-md-2'
              style={{ color: brandColor }}
            >
              € {prodotto.prezzo.toFixed(2)}
            </p>

            <hr className='my-3' />

            {/* TABELLA DETTAGLI CHIAVE */}
            <h4 className='mb-3 fs-6 fs-md-5'>Dettagli Prodotto</h4>
            <Row className='mb-4 fs-7-custom fs-md-6'>
              <Col xs={4} className='fw-bold'>
                Condizione:
              </Col>
              <Col xs={8}>{prodotto.condizione}</Col>
              <Col xs={4} className='fw-bold'>
                Venditore:
              </Col>
              <Col xs={8}>
                {prodotto.venditore ? (
                  <Link to={`/utenti/${prodotto.venditore.id}`}>
                    {prodotto.venditore.username}
                  </Link>
                ) : (
                  'N/D'
                )}
              </Col>
              <Col xs={4} className='fw-bold'>
                Categoria:
              </Col>
              <Col xs={8}>{prodotto.categoria || 'N/D'}</Col>
            </Row>

            {/* DESCRIZIONE */}
            <h4 className='mb-2 fs-6 fs-md-5'>Descrizione</h4>
            <p className='small text-muted mb-4 fs-7-custom fs-md-6'>
              {prodotto.descrizione}
            </p>

            <hr className='d-sm-block d-none' />
            {/* BOTTONI DI AZIONE (VISIBILI SOLO SU DESKTOP/COLONNA) */}
            <div className='d-none d-md-block'>{renderActionButtons()}</div>
          </Col>
        </Row>

        <hr className='d-block d-sm-none' />

        {/* ALTRI ANNUNCI DEL VENDITORE */}
        {totalSellerProductsCount > 0 && !isOwner && (
          <div className='mt-5'>
            <h4 className='mb-3 fs-5 fs-md-4'>
              Altri annunci di {venditoreUsername}
            </h4>
            <hr className='d-sm-block d-none' />

            {isLoadingOther ? (
              <LoadingSpinner size='sm' />
            ) : otherProducts.length > 0 ? (
              <Row className='g-4' xs={2} sm={2} md={4} lg={4}>
                {otherProducts.map((otherProdotto) => (
                  <Col key={otherProdotto.id}>
                    <ProductCard prodotto={otherProdotto} />
                  </Col>
                ))}
              </Row>
            ) : totalSellerProductsCount === 1 ? (
              <Alert variant='info'>
                Il venditore ({venditoreUsername}) ha solo questo annuncio
                attivo in vendita al momento.
              </Alert>
            ) : (
              <Alert variant='info'>
                Nessun altro annuncio disponibile da questo venditore.
              </Alert>
            )}
          </div>
        )}

        {/* MODAL CAROUSELLO (Lasciato invariato) */}
        <Modal show={showModal} onHide={handleCloseModal} size='xl' centered>
          <Modal.Header closeButton>
            <Modal.Title>Immagini Prodotto</Modal.Title>
          </Modal.Header>
          <Modal.Body className='p-0'>
            <Carousel
              activeIndex={modalIndex}
              onSelect={(idx) => setModalIndex(idx)}
              interval={null}
            >
              {immaginiCarousel.map((img, index) => (
                <Carousel.Item key={img.id || index}>
                  <img
                    className='d-block w-100'
                    src={img.url}
                    alt={`${prodotto.titolo} - ${index}`}
                    style={{ maxHeight: '80vh', objectFit: 'contain' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </Modal.Body>
        </Modal>
      </Container>

      {/* === BARRA DI AZIONE FISSA IN BASSO (MOBILE) === */}
      {(canBuy || canModerate) && (
        <footer className='fixed-bottom bg-white border-top shadow-lg z-3 d-md-none mobile-action-bar'>
          <Container fluid className='px-3 py-3'>
            {renderActionButtons(true)}
          </Container>
        </footer>
      )}
    </>
  );
}

export default Details;
