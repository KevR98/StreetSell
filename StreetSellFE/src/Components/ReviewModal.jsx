import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const REVIEW_ENDPOINT = 'http://localhost:8888/recensioni';

function ReviewModal({ show, handleClose, orderId, token, onReviewSuccess }) {
  // 🛑 Nota: usiamo 'valutazione' come nel tuo backend (Recensione.java)
  const [valutazione, setValutazione] = useState(5);
  const [commento, setCommento] = useState('');
  const [hover, setHover] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (valutazione < 1 || !orderId) return;

    setIsSubmitting(true);
    setError(null);

    const payload = {
      ordineId: orderId,
      valutazione: valutazione,
      commento: commento.trim() || null, // Invia null se vuoto
    };

    try {
      const response = await fetch(REVIEW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Recensione inviata con successo!');
        // Chiama la callback per aggiornare l'interfaccia principale
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
          {/* 1. SEZIONE RATING A STELLE */}
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

          {/* 2. SEZIONE COMMENTO */}
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
