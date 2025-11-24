import { useEffect, useState } from 'react';
import { Card, Spinner, Alert, ListGroup, Pagination } from 'react-bootstrap';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
// 🛑 Importa l'icona a stella per una visualizzazione pulita
import { FaStar } from 'react-icons/fa';

const endpoint = 'http://localhost:8888/utenti';

const RecensioniList = ({ utenteId }) => {
  // Stato per i dati di riepilogo del rating
  const [ratingData, setRatingData] = useState({
    averageRating: 0.0,
    reviewCount: 0,
  });
  // Stato per la lista di recensioni paginata
  const [recensioniPage, setRecensioniPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Pagina corrente (inizia da 0)

  const size = 5; // Elementi per pagina

  useEffect(() => {
    if (!utenteId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch del Rating e Conteggio
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

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < recensioniPage.totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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

  // --- RENDERING ---

  const { averageRating, reviewCount } = ratingData;
  const recensioni = recensioniPage?.content || [];
  const roundedRating = Math.round(averageRating); // Rating arrotondato per le stelle

  return (
    <div className='recensioni-list'>
      <h3 className='mb-3'>Valutazione e Recensioni Ricevute</h3>

      <hr />

      {/* 🛑 Blocco 1: Riepilogo del Rating (MODIFICATO) */}
      <Card
        className='border-0 mb-4 p-3'
        style={{ backgroundColor: 'transparent' }}
      >
        <Card.Body className='d-flex align-items-center justify-content-between'>
          {/* 1. Rating Numerico e Stelle Medie */}
          <div className='text-center flex-grow-1'>
            <p className='mb-0 fw-bold' style={{ fontSize: '1.2rem' }}>
              Rating Medio:
            </p>
            <div className='d-flex align-items-center justify-content-center'>
              <span className='display-4 me-3'>
                {reviewCount > 0 ? averageRating.toFixed(1) : 'N/A'}
              </span>
              {/* Visualizzazione delle stelle medie */}
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

          {/* 2. Conteggio Recensioni (MODIFICATO in p con font più grande) */}
          <div className='text-center ps-4 border-start'>
            <p className='mb-0 text-muted'>Totale Recensioni:</p>
            <p style={{ fontSize: '2rem' }}>{reviewCount}</p>
          </div>
        </Card.Body>
      </Card>

      <hr />

      {/* Blocco 2: Contenuto Principale */}
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert />}

      {!loading && !error && (
        <>
          {/* Lista delle Recensioni */}
          {recensioni.length > 0 ? (
            <ListGroup variant='flush'>
              <h3 className='mb-3'>Commenti</h3>
              {recensioni.map((r) => (
                <ListGroup.Item
                  key={r.id}
                  style={{ backgroundColor: 'transparent' }}
                >
                  <div className='d-flex justify-content-between align-items-start'>
                    <h6 className='mb-1 text-warning'>
                      {/* 🛑 Utilizzo di FaStar per la valutazione */}
                      {[...Array(r.valutazione)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={16}
                          color='#ffc107'
                          className='me-1'
                        />
                      ))}
                      <span className='ms-1 text-dark'>
                        {r.valutazione} / 5
                      </span>
                    </h6>
                    <small className='text-muted'>
                      {new Date(r.dataCreazione).toLocaleDateString()}
                    </small>
                  </div>
                  <p className='mb-1'>{r.commento}</p>
                  <footer className='blockquote-footer mt-1'>
                    Scritta da: {r.recensore.username}
                  </footer>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant='info'>Ancora nessuna recensione ricevuta.</Alert>
          )}

          {/* Paginazione */}
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
                onClick={() => handlePageChange(recensioniPage.totalPages - 1)}
                disabled={currentPage === recensioniPage.totalPages - 1}
              />
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
};

export default RecensioniList;
