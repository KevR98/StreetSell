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
  Alert, // Aggiunto Alert
  Card, // Aggiunto Card per la visualizzazione
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

  // Stati del Modal Carosello
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // STATO PER GLI ALTRI ANNUNCI
  const [otherProducts, setOtherProducts] = useState([]);
  const [isLoadingOther, setIsLoadingOther] = useState(false);

  // Conteggio totale prima del filtro (incluso il prodotto corrente)
  const [totalSellerProductsCount, setTotalSellerProductsCount] = useState(0);

  // UNZIONE FETCH PER GLI ALTRI ANNUNCI
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

        // IMPOSTA IL CONTEGGIO TOTALE PRIMA DEL FILTRO
        setTotalSellerProductsCount(rawData.length);

        // Filtra il prodotto corrente dalla lista e limita a 4
        const filteredData = rawData
          .filter((p) => p.id !== prodottoId)
          .slice(0, 4);

        setOtherProducts(filteredData);
      })
      .catch((err) => {
        console.error('Errore nel caricamento degli altri prodotti:', err);
        setOtherProducts([]);
        setTotalSellerProductsCount(0); // Resetta il conteggio in caso di errore
      })
      .finally(() => setIsLoadingOther(false));
  };

  // Logica fetch principale
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

        // Dopo aver caricato il prodotto, se ha un venditore, carichiamo gli altri annunci
        if (prodottoDetail.venditore && prodottoDetail.venditore.id) {
          fetchOtherProducts(prodottoDetail.venditore.id);
        } else {
          // Se non c'è venditore, forziamo il reset dei conteggi
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

  // Logica per le immagini (miniatura e fallback)
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

  return (
    <Container className='my-5'>
      <BackButton />

      <Row>
        {/* COLONNA 1 (md=6): GRIGLIA IMMAGINI */}
        <Col
          md={6}
          className='d-flex flex-wrap gap-2'
          style={{ backgroundColor: 'transparent' }}
        >
          {visibleImages.map((img, index) => {
            const isLarge = index === 0;
            const smallImageHeight = '196px';

            const sizeStyle = {
              width: isLarge ? '100%' : 'calc(50% - 8px)',
              height: isLarge ? '400px' : smallImageHeight,
              overflow: 'hidden',
              borderRadius: '8px',
              cursor: 'pointer',
              position: 'relative',
            };

            const showOverlay = index === 2 && remainingImagesCount > 0;

            const clickHandler = showOverlay
              ? () => handleShowModal(index)
              : () => handleShowModal(index);

            return (
              <div
                key={img.id || index}
                style={sizeStyle}
                onClick={clickHandler}
              >
                <img
                  src={img.url}
                  alt={`${prodotto.titolo} - ${index}`}
                  className='w-100 h-100'
                  style={{ objectFit: 'cover' }}
                />

                {/* Badge per le immagini rimanenti */}
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
                      style={{
                        fontSize: '1.2em',
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
        </Col>

        <Col md={6} className='pt-4 pt-md-0'>
          {/* TITOLO E PREZZO */}
          <h3 className='mb-2 fw-bold'>{prodotto.titolo}</h3>

          <p className='fw-bold mb-3' style={{ fontSize: '1.8rem' }}>
            € {prodotto.prezzo.toFixed(2)}
          </p>

          <hr className='my-3' />

          {/* TABELLA DETTAGLI CHIAVE */}
          <h4 className='mb-3'>Dettagli Prodotto</h4>
          <Row className='mb-4 small'>
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
          <h4 className='mb-2'>Descrizione</h4>
          <p className='small text-muted mb-4'>{prodotto.descrizione}</p>

          <hr className='my-3' />

          {/* BOTTONI DI AZIONE (ACQUISTA/MODIFICA) */}
          {canModerate ? (
            <div className='d-flex gap-3'>
              <Link
                to={`/modifica-prodotto/${prodotto.id}`}
                className='btn btn-warning btn-lg flex-grow-1'
              >
                ✏️ Modifica Annuncio
              </Link>
              <Button
                variant='danger'
                size='lg'
                className='flex-grow-1'
                onClick={handleDelete}
              >
                🗑️ Elimina Annuncio
              </Button>
            </div>
          ) : canBuy ? (
            <div className='d-flex flex-column gap-2'>
              <Order prodottoId={prodotto.id} />
              <Button
                style={{
                  color: brandColor,
                  backgroundColor: 'transparent',
                  borderColor: brandColor,
                }}
                size='lg'
                className='w-100'
              >
                Fai un'offerta
              </Button>
            </div>
          ) : (
            <Button variant='secondary' size='lg' className='w-100' disabled>
              Non Disponibile / Venduto
            </Button>
          )}
        </Col>
      </Row>

      {/* ALTRI ANNUNCI DEL VENDITORE */}
      {totalSellerProductsCount > 0 && !isOwner && (
        <div className='mt-5'>
          <h4 className='mb-3'>Altri annunci di {venditoreUsername}</h4>
          <hr />

          {isLoadingOther ? (
            <LoadingSpinner size='sm' />
          ) : otherProducts.length > 0 ? (
            <Row className='g-4'>
              {otherProducts.map((otherProdotto) => (
                <Col md={3} sm={6} xs={12} key={otherProdotto.id}>
                  <ProductCard prodotto={otherProdotto} />
                </Col>
              ))}
            </Row>
          ) : totalSellerProductsCount === 1 ? (
            // SOLO QUESTO PRODOTTO IN VENDITA
            <Alert variant='info'>
              Il venditore ({venditoreUsername}) ha solo questo annuncio attivo
              in vendita al momento.
            </Alert>
          ) : (
            // NESSUN PRODOTTO (dovrebbe essere coperto dal count > 0)
            <Alert variant='info'>
              Nessun altro annuncio disponibile da questo venditore.
            </Alert>
          )}
        </div>
      )}

      {/* MODAL CAROUSELLO (NON MODIFICATO) */}
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
  );
}

export default Details;
