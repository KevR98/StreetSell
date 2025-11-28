import { useEffect, useState } from 'react';
import { Card, ListGroup, Pagination, Image, Alert } from 'react-bootstrap';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import { FaStar } from 'react-icons/fa';

// Immagine di default per l'avatar
import avatarDefault from '../assets/streetsell-profile-pic.png';

const endpoint = 'http://localhost:8888/utenti';

/**
 * Componente per visualizzare la lista paginata delle recensioni ricevute da un utente.
 */
const RecensioniList = ({ utenteId }) => {
  // Stato per i dati di riepilogo del rating
  const [ratingData, setRatingData] = useState({
    averageRating: 0.0,
    reviewCount: 0,
  });
  // Stato per la lista di recensioni paginata (contiene content, totalPages, number)
  const [recensioniPage, setRecensioniPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Pagina corrente (API usa base 0)

  const size = 5; // Elementi per pagina

  /**
   * Effettua il fetch sia del riepilogo del rating che della lista paginata delle recensioni.
   */
  useEffect(() => {
    if (!utenteId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch del Rating e Conteggio (Rating API)
        const ratingRes = await fetch(`${endpoint}/${utenteId}/rating`);
        const ratingJson = await ratingRes.json();
        setRatingData(ratingJson);

        // 2. Fetch della Lista Recensioni per la pagina corrente
        const reviewsRes = await fetch(
          `${endpoint}/${utenteId}/recensioni?page=${currentPage}&size=${size}`
        );

        if (!reviewsRes.ok) {
          throw new Error(
            `Errore nel caricamento recensioni: ${reviewsRes.status}`
          );
        }

        const reviewsJson = await reviewsRes.json();
        setRecensioniPage(reviewsJson); // Contiene 'content', 'totalPages', 'number'
      } catch (err) {
        console.error('Errore nel caricamento recensioni:', err);
        setError('Impossibile caricare i dati delle recensioni.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [utenteId, currentPage]); // Rilancia la fetch quando cambia l'utente o la pagina

  /**
   * Gestisce il cambio di pagina nella paginazione.
   */
  const handlePageChange = (pageNumber) => {
    if (
      recensioniPage &&
      pageNumber >= 0 &&
      pageNumber < recensioniPage.totalPages
    ) {
      setCurrentPage(pageNumber);
    }
  };

  /**
   * Renderizza gli elementi numerici della paginazione.
   */
  const renderPaginationItems = () => {
    if (!recensioniPage || recensioniPage.totalPages <= 1) return null;

    let items = [];
    for (let number = 0; number < recensioniPage.totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === recensioniPage.number}
          onClick={() => handlePageChange(number)}
        >
          {number + 1}
        </Pagination.Item>
      );
    }
    return items;
  };

  // --- VARIABILI DI RENDERING ---

  const { averageRating, reviewCount } = ratingData;
  const recensioni = recensioniPage?.content || [];
  const roundedRating = Math.round(averageRating); // Rating arrotondato per le stelle medie

  return (
    <div className='recensioni-list'>
      <h3 className='mb-3'>Valutazione e Recensioni Ricevute</h3>

      <hr />

      {/* Riepilogo del Rating */}
      <Card
        className='border-0 mb-4 p-3'
        style={{ backgroundColor: 'transparent' }}
      >
        <Card.Body className='d-flex align-items-center justify-content-between'>
          {/* Rating Numerico e Stelle Medie */}
          <div className='text-center flex-grow-1'>
            <p className='mb-0 fw-bold' style={{ fontSize: '1.2rem' }}>
              Rating Medio:
            </p>
            <div className='d-flex align-items-center justify-content-center'>
              <span className='display-4 me-3'>
                {reviewCount > 0 ? averageRating.toFixed(1) : 'N/A'}
              </span>
              {/* Visualizzazione delle stelle medie (arrotondate) */}
              <div className='d-flex'>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    size={28}
                    color={i < roundedRating ? '#ffc107' : '#e4e5e9'}
                    className='mx-1'
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Conteggio Recensioni */}
          <div className='text-center ps-4 border-start'>
            <p className='mb-0 text-muted'>Totale Recensioni:</p>
            <p style={{ fontSize: '2rem' }}>{reviewCount}</p>
          </div>
        </Card.Body>
      </Card>

      <hr />

      {/* Contenuto Principale */}
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && (
        <>
          {/* Lista delle Recensioni */}
          {recensioni.length > 0 ? (
            <ListGroup variant='flush'>
              <h3 className='mb-3'>Commenti</h3>
              {recensioni.map((r) => {
                // Logica per l'Avatar del recensore
                const reviewAvatarUrl =
                  r.recensore.avatarUrl && r.recensore.avatarUrl !== 'default'
                    ? r.recensore.avatarUrl
                    : avatarDefault;

                return (
                  <ListGroup.Item
                    key={r.id}
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      {/* BLOCCO SINISTRO: Avatar + Username + Rating */}
                      <div className='d-flex align-items-center'>
                        {/* Avatar */}
                        <Image
                          src={reviewAvatarUrl}
                          alt={`${r.recensore.username} Avatar`}
                          roundedCircle
                          className='me-2'
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                          }}
                        />

                        {/* USERNAME e RATING (Raggruppati) */}
                        <div className='d-flex align-items-center'>
                          <span className='text-dark fw-bold me-2'>
                            {r.recensore.username}
                          </span>

                          <h6 className='mb-0 text-warning d-flex align-items-center ms-2'>
                            {/* Visualizzazione delle stelle per la singola recensione */}
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                size={16}
                                color={
                                  i < r.valutazione ? '#ffc107' : '#e4e5e9'
                                }
                                className='me-1'
                              />
                            ))}
                            <span className='ms-1 text-dark fw-normal'>
                              / 5
                            </span>
                          </h6>
                        </div>
                      </div>

                      {/* BLOCCO DESTRO: Data di Creazione */}
                      <small className='text-muted flex-shrink-0'>
                        {new Date(r.dataCreazione).toLocaleDateString()}
                      </small>
                    </div>
                    {/* Commento della recensione */}
                    <p className='mb-1'>- {r.commento}</p>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          ) : (
            <Alert variant='info' className='fs-7-custom fs-md-6'>
              Nessuna recensione ricevuta per questo utente.
            </Alert>
          )}

          {/* Paginazione */}
          {recensioniPage && recensioniPage.totalPages > 1 && (
            <div className='d-flex justify-content-center mt-3'>
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                />
                {renderPaginationItems()}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === recensioniPage.totalPages - 1}
                />
                <Pagination.Last
                  onClick={() =>
                    handlePageChange(recensioniPage.totalPages - 1)
                  }
                  disabled={currentPage === recensioniPage.totalPages - 1}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecensioniList;
