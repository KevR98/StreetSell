import { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

/**
 * Componente per l'aggiunta di un nuovo indirizzo di spedizione da parte dell'utente.
 *
 * @param {object} props - Le proprietà del componente.
 * @param {function} onAddressAdded - Funzione da chiamare al successo dell'API per aggiornare la lista nel genitore.
 * @param {function} onCancel - Funzione da chiamare per annullare l'operazione (e chiudere il form/modal).
 * @param {string} token - Il token di autenticazione JWT.
 */
function Indirizzo({ onAddressAdded, onCancel, token }) {
  // Stato per i dati del form
  const [formData, setFormData] = useState({
    via: '',
    citta: '',
    cap: '',
    provincia: '',
    nazione: '',
  });
  // Stato per la gestione del caricamento e dell'errore
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Gestisce l'aggiornamento dello stato del form ad ogni cambiamento negli input.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Gestisce l'invio del form per aggiungere il nuovo indirizzo.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Controllo che il token sia presente prima di procedere
    if (!token) {
      setError("Autenticazione mancante. Impossibile salvare l'indirizzo.");
      setIsLoading(false);
      return;
    }

    // Chiamata API per l'inserimento del nuovo indirizzo
    fetch('http://localhost:8888/indirizzi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) {
          // Gestione degli errori del backend (es. validazione)
          return res.json().then((errData) => {
            // Tenta di estrarre un messaggio di errore leggibile
            const errorMessage = errData.errors
              ? errData.errors.map((err) => err.defaultMessage).join(', ')
              : errData.message;
            throw new Error(
              errorMessage || "Errore durante l'aggiunta dell'indirizzo."
            );
          });
        }
        return res.json();
      })
      .then((newAddress) => {
        // Successo: Chiama la funzione di callback del genitore e chiude il form
        onAddressAdded(newAddress);
      })
      .catch((err) => {
        // Cattura e visualizza l'errore
        setError(err.message);
      })
      .finally(() => {
        // Termina lo stato di caricamento
        setIsLoading(false);
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Visualizzazione dell'errore se presente */}
      {error && <Alert variant='danger'>{error}</Alert>}

      {/* Campi del Modulo */}
      <Row>
        <Form.Group as={Col} className='mb-3'>
          <Form.Control
            name='via'
            placeholder='Via e Numero Civico'
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col} md={6} className='mb-3'>
          <Form.Control
            name='citta'
            placeholder='Città'
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group as={Col} md={6} className='mb-3'>
          <Form.Control
            name='cap'
            placeholder='CAP'
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col} md={6} className='mb-3'>
          <Form.Control
            name='provincia'
            placeholder='Provincia (Es. MI)'
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group as={Col} md={6} className='mb-3'>
          <Form.Control
            name='nazione'
            placeholder='Nazione'
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      {/* Bottoni di Azione */}
      <div className='d-flex justify-content-end gap-2'>
        <Button variant='outline-secondary' onClick={onCancel}>
          Annulla
        </Button>
        <Button variant='primary' type='submit' disabled={isLoading}>
          {isLoading ? 'Salvataggio...' : 'Salva Indirizzo'}
        </Button>
      </div>
    </Form>
  );
}

export default Indirizzo;
