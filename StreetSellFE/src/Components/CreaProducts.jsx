import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Image,
} from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';

const endpoint = 'http://localhost:8888/prodotti';

// ✅ BRAND COLOR
const BRAND_COLOR = '#fa8229';

function CreaProductPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [prodotto, setProdotto] = useState({
    titolo: '',
    descrizione: '',
    prezzo: 0,
    condizione: 'NUOVO',
    categoria: '',
  });

  // Immagini nuove da caricare
  const [nuoveImmagini, setNuoveImmagini] = useState([]);
  // Immagini esistenti (solo in modifica)
  const [immaginiEsistenti, setImmaginiEsistenti] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // ✅ STILE INPUT BASE (per contrasto su sfondo trasparente)
  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  // ✅ STILE BOTTONE PRIMARIO
  const primaryButtonStyle = {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  };

  // Caricamento dati iniziali per modifica
  useEffect(() => {
    if (isEditing) {
      setIsFetchingData(true);
      fetch(`${endpoint}/${id}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Errore nel recupero del prodotto');
        })
        .then((data) => {
          setProdotto({
            titolo: data.titolo,
            descrizione: data.descrizione,
            prezzo: data.prezzo,
            condizione: data.condizione,
            categoria: data.categoria,
          });
          setImmaginiEsistenti(data.immagini || []);
          setIsFetchingData(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsFetchingData(false);
        });
    }
  }, [id, isEditing]);

  // Gestione input file
  const handleFileChange = (e) => {
    setNuoveImmagini(Array.from(e.target.files));
  };

  // Gestione input testo
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProdotto({ ...prodotto, [name]: value });
  };

  // Gestione eliminazione singola immagine esistente
  const handleDeleteExistingImage = (imgId) => {
    if (!window.confirm('Vuoi davvero eliminare questa immagine?')) return;

    fetch(`${endpoint}/${id}/immagini/${imgId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          // Rimuove l'immagine dallo stato locale per aggiornare la UI
          setImmaginiEsistenti((prev) =>
            prev.filter((img) => img.id !== imgId)
          );
        } else {
          alert("Errore durante l'eliminazione dell'immagine");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess('');

    if (!token) {
      setError('Devi essere autenticato.');
      setIsLoading(false);
      return;
    }

    const prodottoPayload = {
      ...prodotto,
      prezzo: parseFloat(prodotto.prezzo),
    };

    // PREPARAZIONE DATI
    // Ora usiamo SEMPRE FormData perché sia POST che PUT nel backend accettano Multipart
    const formData = new FormData();
    const prodottoBlob = new Blob([JSON.stringify(prodottoPayload)], {
      type: 'application/json',
    });
    formData.append('prodotto', prodottoBlob);

    // Aggiungi le NUOVE immagini se presenti
    nuoveImmagini.forEach((img) => formData.append('immagini', img));

    let url = endpoint;
    let method = 'POST';

    if (isEditing) {
      url = `${endpoint}/${id}`;
      method = 'PUT';
    }

    fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((errorData) => {
          let errorMessage = 'Errore sconosciuto';
          if (Array.isArray(errorData)) {
            errorMessage = errorData.join('; ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = `Errore HTTP ${res.status}`;
          }
          throw new Error(errorMessage);
        });
      })
      .then(() => {
        setSuccess(isEditing ? 'Prodotto aggiornato!' : 'Annuncio creato!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  if (isFetchingData) {
    return <LoadingSpinner />;
  }

  return (
    <Container className='my-5'>
      <BackButton />
      <Row className='justify-content-center'>
        <Col md={8} lg={8}>
          <Card
            className='border-0'
            // ✅ Rimosso shadow-sm, reso trasparente
            style={{ backgroundColor: 'transparent' }}
          >
            <Card.Body>
              <h1 className='text-center mb-4'>
                {isEditing
                  ? 'Modifica Annuncio'
                  : 'Metti in Vendita un Articolo'}
              </h1>

              <Form onSubmit={handleSubmit}>
                {/* TITOLO */}
                <Form.Group className='mb-3'>
                  <Form.Label>Titolo</Form.Label>
                  <Form.Control
                    type='text'
                    name='titolo'
                    value={prodotto.titolo}
                    onChange={handleInputChange}
                    required
                    // ✅ Stile input
                    style={inputStyle}
                  />
                </Form.Group>

                {/* DESCRIZIONE */}
                <Form.Group className='mb-3'>
                  <Form.Label>Descrizione</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={4}
                    name='descrizione'
                    value={prodotto.descrizione}
                    onChange={handleInputChange}
                    required
                    // ✅ Stile input
                    style={inputStyle}
                  />
                </Form.Group>

                {/* GESTIONE IMMAGINI ESISTENTI (SOLO IN MODIFICA) */}
                {isEditing && immaginiEsistenti.length > 0 && (
                  <div className='mb-3'>
                    <Form.Label>Immagini Attuali:</Form.Label>
                    <div className='d-flex flex-wrap gap-2'>
                      {immaginiEsistenti.map((img) => (
                        <div key={img.id} style={{ position: 'relative' }}>
                          <Image
                            src={img.url}
                            thumbnail
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                            }}
                          />
                          <Button
                            variant='danger'
                            size='sm'
                            style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              padding: '0 5px',
                            }}
                            onClick={() => handleDeleteExistingImage(img.id)}
                          >
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INPUT FILE (NUOVE IMMAGINI) */}
                <Form.Group className='mb-3'>
                  <Form.Label>
                    {isEditing ? 'Aggiungi Nuove Immagini' : 'Carica Immagini'}
                  </Form.Label>
                  <Form.Control
                    type='file'
                    name='immagini'
                    accept='image/*'
                    multiple
                    onChange={handleFileChange}
                    // ✅ Stile input
                    style={inputStyle}
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
                        // ✅ Stile input
                        style={inputStyle}
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
                        // ✅ Stile input
                        style={inputStyle}
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
                    // ✅ Stile input
                    style={inputStyle}
                  >
                    <option value='NUOVO'>Nuovo</option>
                    <option value='COME_NUOVO'>Usato - Come nuovo</option>
                    <option value='BUONO'>Usato - Buone condizioni</option>
                    <option value='USATO'>Usato</option>
                    <option value='DANNEGGIATO'>Usato - Ma con usure</option>
                  </Form.Select>
                </Form.Group>

                {/* ✅ Sfondo Alert */}
                {error && (
                  <Alert variant='danger' style={{ backgroundColor: 'white' }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert variant='success' style={{ backgroundColor: 'white' }}>
                    {success}
                  </Alert>
                )}

                <div className='d-grid'>
                  <Button
                    type='submit'
                    // ✅ Stile Brand Color
                    style={primaryButtonStyle}
                    size='lg'
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner as='span' size='sm' />{' '}
                        {isEditing ? 'Salvataggio...' : 'Inserimento...'}
                      </>
                    ) : isEditing ? (
                      'Salva Modifiche'
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
