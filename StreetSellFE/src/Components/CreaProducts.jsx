import { useState } from 'react';
import {
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
  const endpoint = 'http://localhost:8888/auth/prodotti';
  const [prodotto, setProdotto] = useState({
    titolo: '',
    descrizione: '',
    prezzo: '',
    condizione: '',
    statoProdotto: 'NUOVO',
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
    Object.entries(prodotto).forEach(([key, value]) => {
      formData.append(key, value);
    });
    // Aggiungi immagini
    immagini.forEach((img) => formData.append('immagini', img));

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

        Authorization: 'Bearer ${token}',
      },
      body: JSON.stringify(prodotto),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Errore nella chiamata');
        }
      })

      .then((data) => {
        setSuccess('Annuncio creato con successo!');
        // Se il backend restituisce l'id del nuovo prodotto, puoi fare: navigate(`/products/${data.id}`)
        setTimeout(() => {
          navigate(`/products/${data.id}`);
        }, 2000);
      })

      .catch((err) => {
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
