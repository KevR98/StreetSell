import { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

function Indirizzo({ onAddressAdded, onCancel, token }) {
  const [formData, setFormData] = useState({
    via: '',
    citta: '',
    cap: '',
    provincia: '',
    nazione: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError("Autenticazione mancante. Impossibile salvare l'indirizzo.");
      setIsLoading(false);
      return;
    }

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
          // Gestione degli errori di validazione del backend
          return res.json().then((errData) => {
            // Estrazione di un messaggio di errore leggibile
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
        // Chiama la funzione del genitore per notificare l'aggiunta e aggiornare la lista
        onAddressAdded(newAddress);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
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
