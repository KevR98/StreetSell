import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function CreaProductPage() {
  const endpoint = 'http://localhost:8888/prodotti';
  const [prodotto, setProdotto] = useState({
    titolo: '',
    descrizione: '',
    prezzo: 0,
    condizione: 'NUOVO',
    categoria: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const navigate = useNavigate();

  const [immagine, setImmagine] = useState([]);

  const immagini = (e) => {
    setImmagine(Array.from(e.target.files));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProdotto({
      ...prodotto,
      [name]: value,
    });
  };

  const creaProdotto = (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess('');

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError(
        'Devi essere autenticato per creare un annuncio. Verrai reindirizzato al login'
      );
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('prodotto', JSON.stringify(prodotto));
    // Aggiungi immagini
    immagine.forEach((img) => formData.append('immagini', img));

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        // <-- 1. Aggiungi 'async' qui

        // Se la chiamata va bene (status 200-299)
        if (res.ok) {
          return res.json();
        }

        // --- Se la chiamata fallisce (es. 400) ---
        // Dobbiamo leggere il messaggio d'errore dal server

        let errorMessage = 'Errore sconosciuto';
        try {
          // 2. LEGGI IL BIGLIETTO: Tentiamo di leggere il JSON di errore
          const errorData = await res.json();

          // 3. Il nostro server (ValidationException) manda un array di stringhe
          if (Array.isArray(errorData)) {
            // Uniamo tutti gli errori in un unico messaggio
            errorMessage = errorData.join('; ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Se il server non manda un JSON, usiamo l'errore standard
          errorMessage = `Errore HTTP ${res.status}: ${res.statusText}`;
        }

        // 4. Lanciamo il VERO messaggio di errore
        throw new Error(errorMessage);
      })
      .then((data) => {
        // Questo blocco .then() viene eseguito SOLO se la chiamata è andata bene
        setSuccess('Annuncio creato con successo!');
        setTimeout(() => {
          navigate(`/products/${data.id}`);
        }, 2000);
      })
      .catch((err) => {
        // 5. ORA QUI 'err.message' CONTIENE IL VERO ERRORE!
        // (es. "Il titolo non può essere vuoto; Il prezzo deve essere positivo")
        setError(err.message);
        setIsLoading(false);
      });
  }; // Chiusura di creaProdotto

  return (
    <Container className='my-5'>
      <Row className='justify-content-center'>
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <Card.Title className='text-center mb-4'>
                Metti in Vendita un Articolo
              </Card.Title>

              <Form onSubmit={creaProdotto}>
                <Form.Group className='mb-3'>
                  <Form.Label>Titolo dell'annuncio</Form.Label>
                  <Form.Control
                    type='text'
                    name='titolo'
                    value={prodotto.titolo}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Descrizione</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={4}
                    name='descrizione'
                    value={prodotto.descrizione}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <input
                  type='file'
                  name='immagine'
                  accept='image/*'
                  multiple
                  onChange={immagini}
                />

                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Prezzo (€)</Form.Label>
                      <Form.Control
                        type='number'
                        step='0.01'
                        name='prezzo'
                        value={prodotto.prezzo}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Categoria</Form.Label>
                      <Form.Control
                        type='text'
                        name='categoria'
                        value={prodotto.categoria}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className='mb-4'>
                  <Form.Label>Condizione</Form.Label>
                  <Form.Select
                    name='condizione'
                    value={prodotto.condizione}
                    onChange={handleInputChange}
                  >
                    {/* Assicurati che questi valori corrispondano al tuo Enum in Java */}
                    <option value='NUOVO'>Nuovo</option>
                    <option value='COME_NUOVO'>Usato - Come nuovo</option>
                    <option value='BUONO'>Usato - Buone condizioni</option>
                    <option value='USATO'>Usato</option>
                    <option value='DANNEGGIATO'>Usato - Ma con usure</option>
                  </Form.Select>
                </Form.Group>

                {error && <Alert variant='danger'>{error}</Alert>}
                {success && <Alert variant='success'>{success}</Alert>}

                <div className='d-grid'>
                  <Button
                    type='submit'
                    variant='primary'
                    size='lg'
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner as='span' size='sm' /> Inserimento...
                      </>
                    ) : (
                      'Crea annuncio'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CreaProductPage;
