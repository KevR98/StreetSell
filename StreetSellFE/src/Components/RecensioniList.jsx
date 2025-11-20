import { useEffect, useState } from 'react';
import { Card, Spinner, Alert, ListGroup, Pagination } from 'react-bootstrap';
// Importa l'icona a stella (potrebbe servire un'icona library come react-icons)
// Per semplicità, useremo emoji o il carattere Unicode (⭐)

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

  const size = 5; // Elementi per pagina, come impostato nel Controller Java

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

  return (
    <div className='recensioni-list'>
      <h3 className='mb-3'>Valutazione e Recensioni Ricevute</h3>

      {/* Blocco 1: Riepilogo del Rating */}
      <Card className='shadow-sm mb-4 text-center'>
        <Card.Body>
          <h4 className='mb-2'>Rating Medio</h4>
          <div className='display-4 fw-bold text-warning'>
            {/* Mostra il rating solo se ci sono recensioni, altrimenti 0.0 */}
            {reviewCount > 0 ? averageRating.toFixed(1) : 'N/A'} / 5.0
          </div>
          <p className='text-muted'>Basato su {reviewCount} recensioni</p>
        </Card.Body>
      </Card>

      {/* Blocco 2: Contenuto Principale */}
      {loading && <Spinner animation='border' className='d-block mx-auto' />}
      {error && <Alert variant='danger'>{error}</Alert>}

      {!loading && !error && (
        <>
          {/* Lista delle Recensioni */}
          {recensioni.length > 0 ? (
            <ListGroup variant='flush'>
              {recensioni.map((r) => (
                <ListGroup.Item key={r.id}>
                  <div className='d-flex justify-content-between align-items-start'>
                    <h6 className='mb-1 text-warning'>
                      {/* Visualizzazione delle stelle (semplificata con emoji) */}
                      {'⭐'.repeat(r.valutazione)} {r.valutazione} / 5
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
