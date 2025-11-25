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
  Nav,
  Badge,
  InputGroup,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  FaTrash,
  FaUser,
  FaCog,
  FaBoxOpen,
  FaKey,
  FaExclamationTriangle,
  FaEyeSlash,
  FaEye,
} from 'react-icons/fa'; // Per il redirect dopo delete
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';
import Indirizzo from './Indirizzo';

// --- ENDPOINTS ---
const ENDPOINT_ME = 'http://localhost:8888/utenti/me';
const ENDPOINT_PASSWORD = 'http://localhost:8888/utenti/me/password'; // Ipotetico endpoint cambio pass
const ENDPOINT_INDIRIZZI = 'http://localhost:8888/indirizzi';

function DetailsProfile() {
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);

  // --- STATO NAVIGAZIONE ---
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'account', 'shipping'

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.username || '',
        citta: currentUser.citta || '',
        nazione: currentUser.nazione || '',
      });

      setAccountData({
        nome: currentUser.nome || '',
        cognome: currentUser.cognome || '',
      });
    }
  }, [currentUser]);

  // --- STATI DATI ---
  // 1. Dettagli Profilo (Username, Città, Nazione)
  const [profileData, setProfileData] = useState({
    username: currentUser?.username || '',
    citta: currentUser?.citta || '',
    nazione: currentUser?.nazione || '',
  });

  // 2. Impostazioni Account (Nome, Cognome)
  const [accountData, setAccountData] = useState({
    nome: currentUser?.nome || '',
    cognome: currentUser?.cognome || '',
  });

  // 3. Cambio Password
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // 4. Indirizzi
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);

  // --- STATI UI (Loading/Errori/Successi) ---
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' }); // type: 'success' | 'danger'

  // --- EFFETTI ---
  useEffect(() => {
    if (activeTab === 'shipping') {
      fetchUserAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --- FUNZIONI DI FETCH ---
  const fetchUserAddresses = () => {
    setLoadingAddresses(true);
    fetch(ENDPOINT_INDIRIZZI, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAddresses(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingAddresses(false));
  };

  // --- GESTORI SUBMIT ---

  // 1. Aggiorna Username e Posizione
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    submitUpdate(profileData, 'Profilo aggiornato con successo!');
  };

  // 2. Aggiorna Nome e Cognome
  const handleUpdateAccountInfo = (e) => {
    e.preventDefault();
    submitUpdate(accountData, 'Informazioni account aggiornate!');
  };

  // Helper generico per chiamate PUT a /utenti/me
  const submitUpdate = (payload, successMsg) => {
    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    fetch(ENDPOINT_ME, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Errore aggiornamento');
        }
        return res.json();
      })
      .then(() => {
        setFeedback({ type: 'success', message: successMsg });
        // Qui dovresti fare un dispatch per aggiornare Redux se necessario
        setIsEditingUsername(false);
      })
      .catch((err) => {
        setFeedback({ type: 'danger', message: err.message });
      })
      .finally(() => setIsLoading(false));
  };

  // 3. Cambio Password
  const handleChangePassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    fetch(ENDPOINT_PASSWORD, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Impossibile cambiare password');
        setFeedback({
          type: 'success',
          message: 'Password cambiata con successo!',
        });
        setPasswordData({ oldPassword: '', newPassword: '' });
      })
      .catch((err) => {
        setFeedback({ type: 'danger', message: err.message });
      })
      .finally(() => setIsLoading(false));
  };

  // 4. Elimina Account
  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'SEI SICURO? Questa azione è irreversibile e cancellerà il tuo account.'
      )
    ) {
      fetch(ENDPOINT_ME, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Errore cancellazione account');
          alert('Account eliminato. Verrai reindirizzato.');
          localStorage.clear();
          window.location.href = '/login'; // O usa navigate
        })
        .catch((err) => alert(err.message));
    }
  };

  // 5. Elimina Indirizzo
  const handleDeleteAddress = (id) => {
    if (!window.confirm('Eliminare questo indirizzo?')) return;
    fetch(`${ENDPOINT_INDIRIZZI}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchUserAddresses());
  };

  // --- RENDER COMPONENTI ---

  const renderFeedback = () => {
    if (!feedback.message) return null;
    return (
      <Alert
        variant={feedback.type}
        onClose={() => setFeedback({ type: '', message: '' })}
        dismissible
      >
        {feedback.message}
      </Alert>
    );
  };

  // CONTENUTO: TAB PROFILO
  const renderProfileTab = () => (
    <Card className='shadow-sm border-0'>
      <Card.Body className='p-4'>
        <h4 className='mb-4'>Dettagli Profilo</h4>
        {renderFeedback()}

        <Form onSubmit={handleUpdateProfile}>
          {/* 1. USERNAME (Layout come da immagine) */}
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <h5 className='m-0'>Username</h5>
            {/* Il bottone Modifica appare solo se non siamo già in modalità modifica */}
            {!isEditingUsername && (
              <Button
                variant='outline-secondary'
                onClick={() => setIsEditingUsername(true)}
              >
                Modifica username
              </Button>
            )}
          </div>

          {/* 1b. Visualizzazione/Modifica dell'Username */}
          {isEditingUsername ? (
            // Modalità MODIFICA: Mostra il Form.Control e il bottone Annulla
            <div className='d-flex gap-2 align-items-center mb-4'>
              <Form.Control
                type='text'
                value={profileData.username}
                onChange={(e) =>
                  setProfileData({ ...profileData, username: e.target.value })
                }
                required
              />
              <Button
                variant='link'
                size='sm'
                onClick={() => setIsEditingUsername(false)}
                className='text-danger p-0'
              >
                Annulla
              </Button>
            </div>
          ) : (
            // Modalità VISUALIZZAZIONE: Mostra solo il valore
            <Alert variant='light' className='py-2 mb-4 fw-bold'>
              {profileData.username}
            </Alert>
          )}

          <hr className='my-4' />

          {/* 2. POSIZIONE (Città, Nazione) - Resta invariata */}
          <h5 className='mb-3'>Posizione</h5>

          <Row>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Città</Form.Label>
                <Form.Control
                  type='text'
                  value={profileData.citta}
                  placeholder='Es. Milano'
                  onChange={(e) =>
                    setProfileData({ ...profileData, citta: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Nazione</Form.Label>
                <Form.Control
                  type='text'
                  value={profileData.nazione}
                  placeholder='Es. Italia'
                  onChange={(e) =>
                    setProfileData({ ...profileData, nazione: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* 3. BOTTONE DI SALVATAGGIO FINALE */}
          <div className='text-end mt-4'>
            <Button variant='primary' type='submit' disabled={isLoading}>
              {isLoading ? <LoadingSpinner size='sm' /> : 'Salva Modifiche'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );

  // CONTENUTO: TAB ACCOUNT
  const renderAccountTab = () => (
    <Card className='shadow-sm border-0'>
      <Card.Body className='p-4'>
        <h4 className='mb-4'>Impostazioni dell'Account</h4>
        {renderFeedback()}

        {/* Sezione Anagrafica */}
        <h6 className='text-muted text-uppercase small ls-1 mb-3'>
          Anagrafica
        </h6>
        <Form onSubmit={handleUpdateAccountInfo} className='mb-5'>
          <Row>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type='text'
                  value={accountData.nome}
                  onChange={(e) =>
                    setAccountData({ ...accountData, nome: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Cognome</Form.Label>
                <Form.Control
                  type='text'
                  value={accountData.cognome}
                  onChange={(e) =>
                    setAccountData({ ...accountData, cognome: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant='outline-primary'
            size='sm'
            type='submit'
            disabled={isLoading}
          >
            Aggiorna
          </Button>
        </Form>

        <hr />

        {/* Sezione Password */}
        <h6 className='text-muted text-uppercase small ls-1 mb-3 mt-4'>
          Sicurezza
        </h6>
        <Form onSubmit={handleChangePassword} className='mb-5'>
          {/* Vecchia Password (con toggle) */}
          <Form.Group className='mb-3'>
            <Form.Label>Vecchia Password</Form.Label>
            <InputGroup>
              <Form.Control
                // Usa lo stato specifico per il tipo
                type={showOldPass ? 'text' : 'password'}
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
                required
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowOldPass(!showOldPass)} // Toggle specifico
              >
                {showOldPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          {/* Nuova Password (con toggle) */}
          <Form.Group className='mb-3'>
            <Form.Label>Nuova Password</Form.Label>
            <InputGroup>
              <Form.Control
                // Usa lo stato specifico per il tipo
                type={showNewPass ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowNewPass(!showNewPass)} // Toggle specifico
              >
                {showNewPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          {/* Conferma Nuova Password (con toggle) */}
          <Form.Group className='mb-4'>
            <Form.Label>Conferma Nuova Password</Form.Label>
            <InputGroup>
              <Form.Control
                // Usa lo stato specifico per il tipo
                type={showConfirmPass ? 'text' : 'password'}
                value={passwordData.confirmNewPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmNewPassword: e.target.value,
                  })
                }
                required
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowConfirmPass(!showConfirmPass)} // Toggle specifico
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            {/* Aggiungi qui un messaggio di errore se le password non corrispondono */}
            {passwordData.newPassword !== passwordData.confirmNewPassword &&
              passwordData.confirmNewPassword.length > 0 && (
                <Form.Text className='text-danger'>
                  Le password non corrispondono.
                </Form.Text>
              )}
          </Form.Group>

          <Button
            variant='outline-dark'
            size='sm'
            type='submit'
            disabled={
              isLoading ||
              passwordData.newPassword !== passwordData.confirmNewPassword
            }
          >
            {isLoading ? (
              <LoadingSpinner size='sm' />
            ) : (
              <>
                <FaKey className='me-2' /> Cambia Password
              </>
            )}
          </Button>
        </Form>

        <hr />

        {/* Zona Pericolo */}
        <div className='bg-danger-subtle p-3 rounded border border-danger'>
          <h6 className='text-danger fw-bold'>
            <FaExclamationTriangle /> Zona Pericolo
          </h6>
          <p className='small text-muted mb-2'>
            Una volta cancellato l'account, non è possibile tornare indietro.
          </p>
          <Button variant='danger' size='sm' onClick={handleDeleteAccount}>
            Elimina Account
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  // CONTENUTO: TAB SPEDIZIONE
  const renderShippingTab = () => (
    <Card className='shadow-sm border-0'>
      <Card.Body className='p-4'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h4 className='m-0'>Indirizzi di Spedizione</h4>
          {!isAddingNewAddr && (
            <Button
              variant='success'
              size='sm'
              onClick={() => setIsAddingNewAddr(true)}
            >
              + Aggiungi Nuovo
            </Button>
          )}
        </div>

        {loadingAddresses && <LoadingSpinner />}

        {isAddingNewAddr ? (
          <div className='bg-light p-3 rounded'>
            <h5>Nuovo Indirizzo</h5>
            <Indirizzo
              token={token}
              onAddressAdded={() => {
                fetchUserAddresses();
                setIsAddingNewAddr(false);
              }}
              onCancel={() => setIsAddingNewAddr(false)}
            />
          </div>
        ) : (
          <ListGroup variant='flush'>
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <ListGroup.Item
                  key={addr.id}
                  className='d-flex justify-content-between align-items-center py-3'
                >
                  <div>
                    <div className='fw-bold'>
                      {addr.via}, {addr.civico}
                    </div>
                    <div className='text-muted small'>
                      {addr.cap} {addr.citta} ({addr.provincia}), {addr.nazione}
                    </div>
                    {addr.isDefault && (
                      <Badge bg='success' className='mt-1'>
                        Predefinito
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant='outline-danger'
                    size='sm'
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    <FaTrash />
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <Alert variant='info'>
                Non hai ancora salvato nessun indirizzo.
              </Alert>
            )}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );

  if (!currentUser) return <Alert variant='danger'>Accesso Negato.</Alert>;

  return (
    <Container className='my-5'>
      <BackButton />
      <h2 className='mb-4 fw-bold'>Impostazioni</h2>

      <Row>
        {/* COLONNA SINISTRA: NAVIGAZIONE */}
        <Col md={3} className='mb-4'>
          <Card className='shadow-sm border-0'>
            <Card.Body className='p-2'>
              <Nav
                variant='pills'
                className='flex-column gap-1'
                activeKey={activeTab}
              >
                <Nav.Link
                  eventKey='profile'
                  onClick={() => setActiveTab('profile')}
                  className={
                    activeTab === 'profile'
                      ? 'bg-primary text-white fw-bold'
                      : 'text-dark'
                  }
                >
                  <FaUser className='me-2' /> Dettagli Profilo
                </Nav.Link>
                <Nav.Link
                  eventKey='account'
                  onClick={() => setActiveTab('account')}
                  className={
                    activeTab === 'account'
                      ? 'bg-primary text-white fw-bold'
                      : 'text-dark'
                  }
                >
                  <FaCog className='me-2' /> Impostazioni Account
                </Nav.Link>
                <Nav.Link
                  eventKey='shipping'
                  onClick={() => setActiveTab('shipping')}
                  className={
                    activeTab === 'shipping'
                      ? 'bg-primary text-white fw-bold'
                      : 'text-dark'
                  }
                >
                  <FaBoxOpen className='me-2' /> Spedizione
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* COLONNA DESTRA: CONTENUTO DINAMICO */}
        <Col md={9}>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'account' && renderAccountTab()}
          {activeTab === 'shipping' && renderShippingTab()}
        </Col>
      </Row>
    </Container>
  );
}

export default DetailsProfile;
