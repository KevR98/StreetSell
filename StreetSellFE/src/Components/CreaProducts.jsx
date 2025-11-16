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

const endpoint = 'http://localhost:8888/prodotti';

function CreaProduct() {
  const [prodotto, setProdotto] = useState({
    titolo: '',
    descrizione: '',
    prezzo: 0,
    condizione: 'NUOVO',
    categoria: '',
  });

  // Usiamo 'immagini' per l'array di file
  const [immagini, setImmagini] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Default a false
  const navigate = useNavigate();

  // Gestore per i file selezionati
  const handleFileChange = (e) => {
    // Trasforma FileList in un Array
    setImmagini(Array.from(e.target.files));
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

    // Controllo Token
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

    // Correzione: assicuriamoci che il prezzo sia un numero
    const prodottoPayload = {
      ...prodotto,
      prezzo: parseFloat(prodotto.prezzo),
    };

    const formData = new FormData();

    // 🚨 CORREZIONE CRUCIALE PER MULTIPART/FORM-DATA E JSON 🚨
    // 1. Convertiamo l'oggetto JSON in un Blob con Content-Type specifico.
    // Questo aiuta Spring a identificare il payload DTO correttamente e previene
    // l'interferenza con l'header Authorization.
    const prodottoBlob = new Blob([JSON.stringify(prodottoPayload)], {
      type: 'application/json',
    });

    // Aggiungiamo il Blob a FormData sotto la chiave "prodotto"
    formData.append('prodotto', prodottoBlob);

    // Aggiungi immagini (la tua logica era corretta)
    immagini.forEach((img) => formData.append('immagini', img));

    fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // 🚨 MANTENIAMO SOLO L'AUTORIZZAZIONE 🚨
        Authorization: `Bearer ${token}`,
        // NON impostare Content-Type, lo fa il browser per FormData
      },
    })
      .then((res) => {
        // CASO 1: Tutto OK (es. 200, 201)
        if (res.ok) {
          return res.json();
        }

        // CASO 2: C'è un errore (es. 400, 403, 500)
        return res.json().then(
          (errorData) => {
            // Tentativo di leggere il JSON di errore (es. ValidationException)
            let errorMessage = 'Errore sconosciuto';
            if (Array.isArray(errorData)) {
              errorMessage = errorData.join('; '); // Unisce gli errori di validazione
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = `Errore HTTP ${res.status}: ${res.statusText}`;
            }

            // Lanciamo l'errore per farlo "saltare" al .catch() finale
            throw new Error(errorMessage);
          },
          () => {
            // Piano B: Fallito il tentativo di leggere il JSON (es. 403 o 500 nudo)
            throw new Error(`Errore HTTP ${res.status}: ${res.statusText}`);
          }
        );
      })
      .then((data) => {
        // Successo!
        setSuccess('Annuncio creato con successo! Reindirizzamento...');
        setTimeout(() => {
          navigate(`/products/${data.id}`);
        }, 2000);
      })
      .catch((err) => {
        // Cattura qualsiasi errore lanciato (di rete, HTTP, o Validazione)
        setError(err.message);
        setIsLoading(false);
      });
  };

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
                {/* Campi Form... */}
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

                {/* Input File Immagini */}
                <Form.Group className='mb-3'>
                  <Form.Label>Carica Immagini</Form.Label>
                  <Form.Control
                    type='file'
                    name='immagini'
                    accept='image/*'
                    multiple
                    onChange={handleFileChange} // Usiamo la nuova funzione
                  />
                </Form.Group>

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

export default CreaProduct;
