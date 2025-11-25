import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  ListGroup,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaTrash, FaCheckCircle, FaStar } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import BackButton from './BackButton';
import Indirizzo from './Indirizzo';

const endpointUtenti = 'http://localhost:8888/utenti/me';
const endpointIndirizzi = 'http://localhost:8888/indirizzi';

function DetailsProfile() {
  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  // Stati per dati personali (nome, cognome)
  const [formData, setFormData] = useState({
    nome: currentUser?.nome || '', // Assumi che questi campi siano nell'oggetto utente
    cognome: currentUser?.cognome || '',
  });
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [detailMessage, setDetailMessage] = useState(null); // Messaggio di successo/errore

  // Stati per indirizzi
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [errorAddresses, setErrorAddresses] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Funzione per caricare gli indirizzi (la stessa usata in Order.jsx)
  const fetchUserAddresses = () => {
    if (!token) return;

    setLoadingAddresses(true);
    setErrorAddresses(null);

    fetch(endpointIndirizzi, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Impossibile caricare gli indirizzi.');
        return res.json();
      })
      .then(setAddresses)
      .catch((err) => {
        console.error(err);
        setErrorAddresses(err.message);
      })
      .finally(() => setLoadingAddresses(false));
  };

  // Funzione per eliminare un indirizzo
  const handleDeleteAddress = (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo indirizzo?'))
      return;

    fetch(`${endpointIndirizzi}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Eliminazione fallita.');
        // Aggiorna la lista nel frontend
        fetchUserAddresses();
      })
      .catch((err) => {
        alert(`Errore: ${err.message}`);
      });
  };

  // Funzione per aggiornare Nome/Cognome (Richiede un endpoint PUT /utenti/me)
  const handleUpdateDetails = (e) => {
    e.preventDefault();
    setIsUpdatingDetails(true);
    setDetailMessage(null);

    fetch(endpointUtenti, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw new Error(err.message || 'Aggiornamento fallito.');
          });
        return res.json();
      })
      // eslint-disable-next-line no-unused-vars
      .then((updatedUser) => {
        setDetailMessage({
          variant: 'success',
          text: 'Dettagli aggiornati con successo!',
        });
      })
      .catch((err) => {
        setDetailMessage({ variant: 'danger', text: `Errore: ${err.message}` });
      })
      .finally(() => setIsUpdatingDetails(false));
  };

  useEffect(() => {
    fetchUserAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!currentUser)
    return <Alert variant='danger'>Accesso Negato. Effettua il login.</Alert>;

  return (
    <Container className='my-5'>
      <BackButton />
      <h1 className='mb-4'>⚙️ Gestione Profilo</h1>

      <Row>
        {/* DATI PERSONALI (Nome, Cognome) */}
        <Col md={5} className='mb-4'>
          <Card className='shadow-sm'>
            <Card.Header as='h5' className='bg-info text-white'>
              Dati Personali
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUpdateDetails}>
                <Form.Group className='mb-3'>
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type='text'
                    name='nome'
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Cognome</Form.Label>
                  <Form.Control
                    type='text'
                    name='cognome'
                    value={formData.cognome}
                    onChange={(e) =>
                      setFormData({ ...formData, cognome: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <div className='text-end'>
                  {detailMessage && (
                    <Alert variant={detailMessage.variant} className='mt-3'>
                      {detailMessage.text}
                    </Alert>
                  )}
                  <Button
                    variant='primary'
                    type='submit'
                    disabled={isUpdatingDetails}
                  >
                    {isUpdatingDetails ? (
                      <LoadingSpinner size='sm' />
                    ) : (
                      'Salva Modifiche'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* INDIRIZZI DI SPEDIZIONE */}
        <Col md={7} className='mb-4'>
          <Card className='shadow-sm'>
            <Card.Header as='h5' className='bg-info text-white'>
              <FaMapMarkerAlt className='me-2' /> Indirizzi di Spedizione
            </Card.Header>
            <Card.Body>
              {errorAddresses && <ErrorAlert message={errorAddresses} />}
              {loadingAddresses ? (
                <LoadingSpinner />
              ) : (
                <>
                  {/* Lista Indirizzi Esistenti */}
                  <ListGroup className='mb-3'>
                    {addresses.length > 0 ? (
                      addresses.map((addr) => (
                        <ListGroup.Item
                          key={addr.id}
                          className='d-flex justify-content-between align-items-center'
                        >
                          <div>
                            {addr.via}, {addr.cap} {addr.citta} (
                            {addr.provincia}) - {addr.nazione}
                            {/* Supponiamo che l'indirizzo default abbia un flag isDefault: true */}
                            {addr.isDefault && (
                              <Badge bg='success' className='ms-2'>
                                Predefinito
                              </Badge>
                            )}
                          </div>
                          <div>
                            {/* Bottone per impostare come predefinito (logica da implementare nel BE) */}
                            <Button
                              variant='danger'
                              size='sm'
                              onClick={() => handleDeleteAddress(addr.id)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <Alert variant='secondary'>
                        Nessun indirizzo salvato.
                      </Alert>
                    )}
                  </ListGroup>

                  {/* Form di Aggiunta Nuovo Indirizzo */}
                  {isAddingNew ? (
                    <Card className='p-3 bg-light'>
                      <h5>Aggiungi Nuovo Indirizzo</h5>
                      <Indirizzo
                        onAddressAdded={() => {
                          fetchUserAddresses(); // Ricarica la lista dopo l'aggiunta
                          setIsAddingNew(false);
                        }}
                        onCancel={() => setIsAddingNew(false)}
                        token={token}
                      />
                    </Card>
                  ) : (
                    <div className='text-end'>
                      <Button
                        variant='outline-info'
                        onClick={() => setIsAddingNew(true)}
                      >
                        + Aggiungi Nuovo Indirizzo
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DetailsProfile;
