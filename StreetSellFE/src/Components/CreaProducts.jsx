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
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';

// L'endpoint di base per tutte le operazioni sui prodotti
const endpoint = 'http://localhost:8888/prodotti';

// Definisco il colore principale del mio brand per uno stile consistente
const BRAND_COLOR = '#fa8229';

function CreaProductPage() {
  // Uso useParams per capire se sto creando o modificando. 'id' sarà definito solo in modifica.
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  // Stato che tiene i dati del prodotto da inviare al server
  const [prodotto, setProdotto] = useState({
    titolo: '',
    descrizione: '',
    prezzo: 0,
    condizione: 'NUOVO', // Valore di default
    categoria: '',
  });

  // Array per le immagini che l'utente carica tramite l'input file (solo le nuove)
  const [nuoveImmagini, setNuoveImmagini] = useState([]);
  // Array per memorizzare i riferimenti alle immagini già salvate (solo in modifica)
  const [immaginiEsistenti, setImmaginiEsistenti] = useState([]);

  // Stati per la gestione dell'interfaccia utente
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Stato per il submit (Creazione/Modifica)
  const [isFetchingData, setIsFetchingData] = useState(false); // Stato per il fetch iniziale (Modifica)

  // Definisco stili per gli input e i bottoni per garantire la coerenza del design

  // Stile base per gli input (utile se lo sfondo del form è trasparente o scuro)
  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  // Stile primario per il bottone di submit, usando il colore del brand
  const primaryButtonStyle = {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  };

  /**
   * Effetto per caricare i dati esistenti del prodotto se siamo in modalità Modifica (isEditing è true).
   * L'effetto viene eseguito solo al montaggio del componente e quando l'ID cambia.
   */
  useEffect(() => {
    if (isEditing) {
      setIsFetchingData(true);
      fetch(`${endpoint}/${id}`)
        .then((res) => {
          if (res.ok) return res.json();
          // Gestione dell'errore di recupero dati
          throw new Error('Errore nel recupero del prodotto');
        })
        .then((data) => {
          // Popolo lo stato del form con i dati recuperati
          setProdotto({
            titolo: data.titolo,
            descrizione: data.descrizione,
            prezzo: data.prezzo,
            condizione: data.condizione,
            categoria: data.categoria,
          });
          // Salvo le immagini esistenti per la visualizzazione e la gestione
          setImmaginiEsistenti(data.immagini || []);
          setIsFetchingData(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsFetchingData(false);
        });
    }
  }, [id, isEditing]);

  /**
   * Gestisce l'input file, salvando i file selezionati nello stato `nuoveImmagini`.
   */
  const handleFileChange = (e) => {
    // Array.from converte la FileList in un array standard
    setNuoveImmagini(Array.from(e.target.files));
  };

  /**
   * Gestisce gli input di testo e select, aggiornando lo stato `prodotto`.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProdotto({ ...prodotto, [name]: value });
  };

  /**
   * Gestisce l'eliminazione di una singola immagine esistente durante la modifica.
   * Invia una richiesta DELETE al server e aggiorna lo stato locale.
   */
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
          // Se la cancellazione sul server ha successo, rimuovo l'immagine
          // dall'array locale per aggiornare l'interfaccia utente senza ricaricare i dati completi.
          setImmaginiEsistenti((prev) =>
            prev.filter((img) => img.id !== imgId)
          );
        } else {
          alert("Errore durante l'eliminazione dell'immagine");
        }
      })
      .catch((err) => console.error(err));
  };

  /**
   * Gestisce l'invio del form (sia Creazione che Modifica).
   * Prepara i dati in formato FormData per gestire l'invio combinato di JSON e file.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess('');

    // Controllo di sicurezza: l'utente deve essere loggato
    if (!token) {
      setError('Devi essere autenticato.');
      setIsLoading(false);
      return;
    }

    // Preparo il payload JSON con la conversione a float per il prezzo
    const prodottoPayload = {
      ...prodotto,
      prezzo: parseFloat(prodotto.prezzo),
    };

    // PREPARAZIONE DATI IN FORMATO MULTIPART (FormData)
    const formData = new FormData();
    // Aggiungo il corpo del prodotto come Blob JSON
    const prodottoBlob = new Blob([JSON.stringify(prodottoPayload)], {
      type: 'application/json',
    });
    formData.append('prodotto', prodottoBlob);

    // Aggiungo le NUOVE immagini selezionate al FormData
    nuoveImmagini.forEach((img) => formData.append('immagini', img));

    let url = endpoint;
    let method = 'POST';

    // Determino l'URL e il metodo HTTP corretti a seconda che sia una Modifica o una Creazione
    if (isEditing) {
      url = `${endpoint}/${id}`;
      method = 'PUT';
    }

    fetch(url, {
      method: method,
      headers: {
        // L'Authorization va SEMPRE nelle headers
        Authorization: `Bearer ${token}`,
        // NON devo specificare Content-Type: multipart/form-data; boundary=...
        // Il browser lo imposta automaticamente e correttamente quando uso FormData
      },
      body: formData, // Invio il corpo FormData
    })
      .then((res) => {
        if (res.ok) return res.json();

        // Gestione avanzata degli errori (tentativo di leggere il messaggio di errore dal body JSON)
        return res.json().then((errorData) => {
          let errorMessage = 'Errore sconosciuto';
          if (Array.isArray(errorData)) {
            // Caso 1: Array di errori (es. validazione)
            errorMessage = errorData.join('; ');
          } else if (errorData.message) {
            // Caso 2: Oggetto con campo 'message'
            errorMessage = errorData.message;
          } else {
            // Caso 3: Errore generico
            errorMessage = `Errore HTTP ${res.status}`;
          }
          throw new Error(errorMessage);
        });
      })
      .then(() => {
        // Successo: Imposto il messaggio e reindirizzo dopo un breve ritardo
        setSuccess(isEditing ? 'Prodotto aggiornato!' : 'Annuncio creato!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      })
      .catch((err) => {
        // Cattura e mostra l'errore
        setError(err.message);
        setIsLoading(false);
      });
  };

  // Mostro lo spinner durante il caricamento dei dati iniziali in modalità modifica
  if (isFetchingData) {
    return <LoadingSpinner />;
  }

  // Render del form
  return (
    <Container className='my-5'>
      <BackButton />
      <Row className='justify-content-center'>
        <Col md={8} lg={8}>
          <Card
            className='border-0'
            // Imposto lo sfondo della card come trasparente
            style={{ backgroundColor: 'transparent' }}
          >
            <Card.Body>
              <h1 className='text-center mb-4'>
                {/* Titolo dinamico a seconda della modalità */}
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
                          {/* Bottone per eliminare l'immagine esistente */}
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
                    multiple // Permette di selezionare più file
                    onChange={handleFileChange}
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
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* SELECT CONDIZIONE */}
                <Form.Group className='mb-4'>
                  <Form.Label>Condizione</Form.Label>
                  <Form.Select
                    name='condizione'
                    value={prodotto.condizione}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value='NUOVO'>Nuovo</option>
                    <option value='COME_NUOVO'>Usato - Come nuovo</option>
                    <option value='BUONO'>Usato - Buone condizioni</option>
                    <option value='USATO'>Usato</option>
                    <option value='DANNEGGIATO'>Usato - Ma con usure</option>
                  </Form.Select>
                </Form.Group>

                {/* Messaggi di Alert (Errori/Successo) */}
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

                {/* BOTTONE SUBMIT */}
                <div className='d-grid'>
                  <Button
                    type='submit'
                    style={primaryButtonStyle}
                    size='lg'
                    disabled={isLoading}
                  >
                    {/* Contenuto del bottone dinamico: Spinner durante il caricamento */}
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
