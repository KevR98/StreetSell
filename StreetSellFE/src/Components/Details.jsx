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
} from 'react-bootstrap';
import BackButton from './BackButton';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import Order from './Order';

const endpoint = 'http://localhost:8888/prodotti';

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

  // Logica fetch (NON MODIFICATA)
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
      })
      .catch((err) => {
        console.error('Errore nel caricamento:', err);
        setIsLoading(false);
        setError(true);
      });
  }, [prodottoId, token]);

  // Logica gestione eliminazione (NON MODIFICATA)
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

  // ----------------------------------------------------
  // GESTIONE STATI DI CARICAMENTO/ERRORE (NON MODIFICATA)
  // ----------------------------------------------------
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

  // Permessi (NON MODIFICATI)
  const isOwner =
    currentUser &&
    prodotto.venditore &&
    currentUser.id === prodotto.venditore.id;

  const isAdmin = currentUser && currentUser.ruolo === 'ADMIN';

  const canModerate = isOwner || isAdmin;

  const canBuy =
    !isOwner && !isAdmin && prodotto.statoProdotto === 'DISPONIBILE';

  // Logica per le immagini (miniatura e fallback) (NON MODIFICATA)
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

  // Funzioni per il Modal Carosello (NON MODIFICATA)
  const handleShowModal = (index) => {
    setModalIndex(index);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  // Variabili per il layout della griglia (MODIFICATA)
  // 🛑 MOSTRA AL MASSIMO 3 IMMAGINI
  const visibleImages = immaginiCarousel.slice(0, 3);
  const remainingImagesCount = numeroImmagini > 3 ? numeroImmagini - 3 : 0;
  // ----------------------------------------------------

  return (
    <Container className='my-5'>
      <BackButton />

      <Row>
        {/* COLONNA 1 (md=6): GRIGLIA IMMAGINI */}
        <Col
          md={6}
          className='d-flex flex-wrap gap-2'
          style={{ backgroundColor: '#f8f9fa' }}
        >
          {visibleImages.map((img, index) => {
            const isLarge = index === 0;
            // Calcola l'altezza per le due immagini sotto
            const smallImageHeight = '196px';

            const sizeStyle = {
              width: isLarge ? '100%' : 'calc(50% - 8px)',
              height: isLarge ? '400px' : smallImageHeight,
              overflow: 'hidden',
              borderRadius: '8px',
              cursor: 'pointer',
              position: 'relative',
            };

            // 🛑 Applica l'overlay +X solo sulla TERZA immagine visibile (index === 2)
            const showOverlay = index === 2 && remainingImagesCount > 0;

            // Se l'immagine è l'ultima visibile E ci sono immagini rimanenti,
            // il click deve aprire il carosello modale.
            // Altrimenti, il click apre il carosello modale impostando l'indice corretto.
            const clickHandler = showOverlay
              ? () => handleShowModal(index) // Apre il modale sull'immagine corrente (index 2)
              : () => handleShowModal(index); // Apre il modale sull'indice cliccato

            return (
              <div
                key={img.id || index}
                style={sizeStyle}
                onClick={clickHandler} // APRE IL MODAL AL CLICK
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

        {/* COLONNA 2 (md=6): DETTAGLI E AZIONI (NON MODIFICATA) */}
        <Col md={6} className='pt-4 pt-md-0'>
          {/* 1. TITOLO E PREZZO */}
          <h3 className='mb-2 fw-bold'>{prodotto.titolo}</h3>

          <p
            className='lead text-primary fw-bold mb-3'
            style={{ fontSize: '1.8rem' }}
          >
            € {prodotto.prezzo.toFixed(2)}
          </p>

          {canBuy && (
            <p className='text-success small'>
              € {(prodotto.prezzo * 1.05).toFixed(2)} include la Protezione
              acquisti
            </p>
          )}

          <hr className='my-3' />

          {/* 2. TABELLA DETTAGLI CHIAVE */}
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

          {/* 3. DESCRIZIONE */}
          <h4 className='mb-2'>Descrizione</h4>
          <p className='small text-muted mb-4'>{prodotto.descrizione}</p>

          <hr className='my-3' />

          {/* 4. BOTTONI DI AZIONE (ACQUISTA/MODIFICA) */}
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
              <Button variant='outline-primary' size='lg' className='w-100'>
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
