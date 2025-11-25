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
import { useDispatch, useSelector } from 'react-redux';
import {
  FaTrash,
  FaUser,
  FaCog,
  FaBoxOpen,
  FaKey,
  FaExclamationTriangle,
  FaEyeSlash,
  FaEye,
  FaTimes, // Importiamo icona per annulla/rimuovi
} from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';
import Indirizzo from './Indirizzo';

// ✅ IMPORT AVATAR
import defaultAvatar from '../assets/streetsell-profile-pic.png';

const ENDPOINT_ME = 'http://localhost:8888/utenti/me';
const ENDPOINT_PASSWORD = 'http://localhost:8888/utenti/me/password';
const ENDPOINT_INDIRIZZI = 'http://localhost:8888/indirizzi';
const ENDPOINT_AVATAR = 'http://localhost:8888/utenti/me/avatar'; // Unico endpoint base per Avatar

function DetailsProfile() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);

  // --- STATI ---
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  // Password
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Dati
  const [profileData, setProfileData] = useState({
    username: currentUser?.username || '',
    citta: currentUser?.citta || '',
    nazione: currentUser?.nazione || '',
    avatarUrl: currentUser?.avatarUrl || '',
  });

  const [accountData, setAccountData] = useState({
    nome: currentUser?.nome || '',
    cognome: currentUser?.cognome || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData((prev) => ({
        ...prev,
        username: currentUser.username || '',
        citta: currentUser.citta || '',
        nazione: currentUser.nazione || '',
        avatarUrl: currentUser.avatarUrl || '',
      }));
      setAccountData({
        nome: currentUser.nome || '',
        cognome: currentUser.cognome || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'shipping') {
      fetchUserAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  const submitTextUpdate = (payload, successMsg) => {
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
        setIsEditingUsername(false);
      })
      .catch((err) => {
        setFeedback({ type: 'danger', message: err.message });
      })
      .finally(() => setIsLoading(false));
  };

  // ✅ 1. FUNZIONE UPLOAD AVATAR (PATCH)
  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const res = await fetch(ENDPOINT_AVATAR, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Errore server: ${res.status} - ${errorText}`);
      }

      const updatedUser = await res.json();

      setFeedback({ type: 'success', message: 'Foto profilo aggiornata!' });

      // Aggiorna stato locale e Redux
      setProfileData((prev) => ({ ...prev, avatarUrl: updatedUser.avatarUrl }));
      dispatch({ type: 'SET_USER', payload: updatedUser });

      setSelectedFile(null);
    } catch (err) {
      console.error('Errore upload:', err);
      setFeedback({ type: 'danger', message: 'Errore caricamento foto.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 2. NUOVA FUNZIONE DELETE AVATAR (DELETE)
  const handleDeleteAvatar = async () => {
    if (!window.confirm('Vuoi davvero rimuovere la foto profilo?')) return;

    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await fetch(ENDPOINT_AVATAR, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Errore durante la rimozione.');

      const updatedUser = await res.json(); // Il backend dovrebbe restituire l'utente aggiornato

      setFeedback({
        type: 'success',
        message: 'Foto rimossa. Ripristinato default.',
      });

      // Aggiorna Redux e Locale (avatarUrl sarà "default" o null)
      setProfileData((prev) => ({ ...prev, avatarUrl: updatedUser.avatarUrl }));
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'danger',
        message: 'Impossibile rimuovere la foto.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    submitTextUpdate(profileData, 'Dettagli profilo aggiornati con successo!');
  };

  const handleUpdateAccountInfo = (e) => {
    e.preventDefault();
    submitTextUpdate(accountData, 'Informazioni account aggiornate!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setFeedback({
        type: 'danger',
        message: 'Le password non corrispondono.',
      });
      return;
    }
    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    fetch(ENDPOINT_PASSWORD, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Impossibile cambiare password');
        setFeedback({ type: 'success', message: 'Password cambiata!' });
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      })
      .catch((err) => setFeedback({ type: 'danger', message: err.message }))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteAccount = () => {
    if (window.confirm('SEI SICURO? Azione irreversibile.')) {
      fetch(ENDPOINT_ME, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Errore cancellazione');
          alert('Account eliminato.');
          localStorage.clear();
          window.location.href = '/login';
        })
        .catch((err) => alert(err.message));
    }
  };

  const handleDeleteAddress = (id) => {
    if (!window.confirm('Eliminare indirizzo?')) return;
    fetch(`${ENDPOINT_INDIRIZZI}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchUserAddresses());
  };

  const renderFeedback = () => {
    if (!feedback || !feedback.message) return null;
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

  const renderProfileTab = () => {
    // Logica visualizzazione: File Selezionato > URL Backend > Default
    const displayAvatarUrl = selectedFile
      ? URL.createObjectURL(selectedFile)
      : profileData.avatarUrl && profileData.avatarUrl !== 'default'
      ? profileData.avatarUrl
      : defaultAvatar;

    // ✅ NUOVA CONDIZIONE CORRETTA:
    // Solo se l'URL esiste E non è la nostra stringa di fallback "default".
    const hasCustomAvatar =
      profileData.avatarUrl && profileData.avatarUrl !== 'default';

    return (
      <Card className='shadow-sm border-0'>
        <Card.Body className='p-4'>
          <h4 className='mb-4'>Dettagli Profilo</h4>
          <hr />
          {renderFeedback()}

          {/* SEZIONE AVATAR */}
          <h5 className='mb-3'>Foto Profilo</h5>
          <div className='d-flex align-items-center justify-content-between mb-4'>
            <div className='d-flex align-items-center'>
              <img
                src={displayAvatarUrl}
                alt='Avatar'
                className='rounded-circle me-4 border border-1 border-secondary-subtle'
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
              <div>
                <h5 className='m-0 fw-bold'>La tua foto</h5>
                <p className='text-muted small mb-0'>
                  Formati supportati: JPG, PNG.
                </p>
              </div>
            </div>

            <div className='d-flex gap-2 align-items-center'>
              <Form.Group className='d-none'>
                <Form.Control
                  type='file'
                  accept='image/*'
                  id='file-input-avatar'
                  onChange={(e) => {
                    setSelectedFile(e.target.files[0]);
                    setFeedback({ type: '', message: '' });
                  }}
                />
              </Form.Group>

              {/* Logica Bottoni */}
              {selectedFile ? (
                // 1. Se ho selezionato un file: MOSTRA "Carica" e "Annulla"
                <>
                  <Button
                    variant='success'
                    size='sm'
                    onClick={handleUploadAvatar}
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size='sm' /> : 'Carica Foto'}
                  </Button>
                  <Button
                    variant='outline-danger'
                    size='sm'
                    onClick={() => setSelectedFile(null)}
                    disabled={isLoading}
                  >
                    Annulla
                  </Button>
                </>
              ) : (
                // 2. Se NON ho selezionato file: MOSTRA "Scegli" e "Rimuovi" (se esiste foto)
                <>
                  <Button
                    variant='outline-secondary'
                    onClick={() =>
                      document.getElementById('file-input-avatar').click()
                    }
                    disabled={isLoading}
                  >
                    Scegli foto
                  </Button>

                  {/* ✅ IL BOTTONE COMPARE SOLO SE hasCustomAvatar è TRUE */}
                  {hasCustomAvatar && (
                    <Button
                      variant='outline-danger'
                      title='Rimuovi foto profilo'
                      onClick={handleDeleteAvatar}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <hr className='my-4' />

          <Form onSubmit={handleUpdateProfile}>
            <div className='d-flex justify-content-between align-items-center mb-2'>
              <h5 className='m-0'>Username</h5>
              {!isEditingUsername && (
                <Button
                  variant='outline-secondary'
                  onClick={() => setIsEditingUsername(true)}
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#005f73',
                    color: '#005f73',
                  }}
                >
                  Modifica username
                </Button>
              )}
            </div>

            {isEditingUsername ? (
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
              <Alert
                variant='light'
                className='py-2 mb-4 fw-bold border bg-white'
              >
                {profileData.username}
              </Alert>
            )}

            <hr className='my-4' />

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
                      setProfileData({
                        ...profileData,
                        nazione: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className='text-end mt-4'>
              <Button
                variant='primary'
                type='submit'
                disabled={isLoading || selectedFile}
              >
                {isLoading ? <LoadingSpinner size='sm' /> : 'Salva Modifiche'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    );
  };

  const renderAccountTab = () => (
    <Card className='shadow-sm border-0'>
      <Card.Body className='p-4'>
        <h4 className='mb-4'>Impostazioni dell'Account</h4>
        {renderFeedback()}
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
        <h6 className='text-muted text-uppercase small ls-1 mb-3 mt-4'>
          Sicurezza
        </h6>
        <Form onSubmit={handleChangePassword} className='mb-5'>
          <Form.Group className='mb-3'>
            <Form.Label>Vecchia Password</Form.Label>
            <InputGroup>
              <Form.Control
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
                onClick={() => setShowOldPass(!showOldPass)}
              >
                {showOldPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Nuova Password</Form.Label>
            <InputGroup>
              <Form.Control
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
                onClick={() => setShowNewPass(!showNewPass)}
              >
                {showNewPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          <Form.Group className='mb-4'>
            <Form.Label>Conferma Nuova Password</Form.Label>
            <InputGroup>
              <Form.Control
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
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
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
