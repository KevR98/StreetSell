import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const reviewEndpoint = 'http://localhost:8888/recensioni';

/**
 * Componente Modal per permettere all'utente di lasciare una recensione (rating e commento)
 * per un ordine completato.
 */
function ReviewModal({ show, handleClose, orderId, token, onReviewSuccess }) {
  // Stato per la valutazione a stelle (obbligatoria, min 1)
  const [valutazione, setValutazione] = useState(5);
  // Stato per il commento (opzionale)
  const [commento, setCommento] = useState('');
  // Stato per l'effetto hover sulle stelle
  const [hover, setHover] = useState(null);
  // Stato per il caricamento durante l'invio
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Stato per la gestione degli errori API
  const [error, setError] = useState(null);

  /**
   * Gestisce l'invio del form e la chiamata API per creare la recensione.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (valutazione < 1 || !orderId) return;

    setIsSubmitting(true);
    setError(null);

    const payload = {
      ordineId: orderId,
      valutazione: valutazione,
      // Invia null se il commento è vuoto o contiene solo spazi
      commento: commento.trim() || null,
    };

    try {
      const response = await fetch(reviewEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Recensione inviata con successo!');
        // Chiama la callback del genitore per aggiornare la lista degli ordini
        onReviewSuccess();
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Errore durante l'invio della recensione."
        );
      }
    } catch (err) {
      setError(err.message);
      console.error('Errore recensione:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resetta gli stati del form prima di chiudere il modal.
   */
  const handleModalClose = () => {
    setValutazione(5);
    setCommento('');
    setError(null);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Lascia un Feedback</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant='danger'>{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* SEZIONE RATING A STELLE */}
          <Form.Group className='mb-3 text-center'>
            <Form.Label className='d-block fw-bold'>
              Valutazione (obbligatoria):
            </Form.Label>
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <label key={ratingValue}>
                  <input
                    type='radio'
                    name='rating'
                    value={ratingValue}
                    onClick={() => setValutazione(ratingValue)}
                    style={{ display: 'none' }}
                  />
                  <FaStar
                    className='star me-1'
                    // Colore basato sull'hover o sulla valutazione corrente
                    color={
                      ratingValue <= (hover || valutazione)
                        ? '#ffc107'
                        : '#e4e5e9'
                    }
                    size={30}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: 'pointer' }}
                  />
                </label>
              );
            })}
          </Form.Group>

          {/* SEZIONE COMMENTO */}
          <Form.Group className='mb-3'>
            <Form.Label>Commento (opzionale):</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Lascia un commento sulla transazione...'
              value={commento}
              onChange={(e) => setCommento(e.target.value)}
            />
          </Form.Group>

          <div className='d-grid gap-2 mt-4'>
            <Button
              type='submit'
              variant='success'
              disabled={isSubmitting || valutazione < 1}
            >
              {isSubmitting
                ? 'Invio...'
                : `Invia Recensione (${valutazione} Stelle)`}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ReviewModal;
