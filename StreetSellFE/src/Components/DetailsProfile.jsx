import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Nav,
  Row,
  Col,
  Alert,
  Badge,
  InputGroup,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaCog, FaBoxOpen } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';

// ✅ IMPORT NUOVE COMPONENTI
import EditProfilePage from './EditProfilePage';
import SettingsPage from './SettingsPage';
import SettingsAddress from './SettingsAddress';

// ✅ NUOVO COLORE BRANDING (Mantenuto qui per la Navigazione)
const BRAND_COLOR = '#fa8229';

// Endpoints
const ENDPOINT_ME = 'http://localhost:8888/utenti/me';
const ENDPOINT_PASSWORD = 'http://localhost:8888/utenti/me/password';
const ENDPOINT_INDIRIZZI = 'http://localhost:8888/indirizzi';
const ENDPOINT_AVATAR = 'http://localhost:8888/utenti/me/avatar';

function DetailsProfile() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);

  // --- STATI E LOGICHE CENTRALI ---
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [selectedFile, setSelectedFile] = useState(null);

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
  // --- FINE STATI ---

  // --- EFFETTI E FUNZIONI (Devono rimanere qui per accedere a tutti gli stati e dispatch) ---

  useEffect(() => {
    /* ... Logica di sincronizzazione currentUser ... */
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
    /* ... Logica fetch indirizzi ... */
    setLoadingAddresses(true);
    fetch(ENDPOINT_INDIRIZZI, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAddresses(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingAddresses(false));
  };

  const submitTextUpdate = (payload, successMsg) => {
    /* ... Logica PUT /me ... */
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
      .catch((err) => setFeedback({ type: 'danger', message: err.message }))
      .finally(() => setIsLoading(false));
  };

  const handleUploadAvatar = async () => {
    /* ... Logica PATCH /avatar ... */
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

  const handleDeleteAvatar = async () => {
    /* ... Logica DELETE /avatar ... */
    if (!window.confirm('Vuoi davvero rimuovere la foto profilo?')) return;
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await fetch(ENDPOINT_AVATAR, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Errore durante la rimozione.');
      const updatedUser = await res.json();
      setFeedback({
        message: 'Foto rimossa. Ripristinato default.',
        type: 'success',
      });
      setProfileData((prev) => ({ ...prev, avatarUrl: updatedUser.avatarUrl }));
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (err) {
      console.error(err);
      setFeedback({
        message: 'Impossibile rimuovere la foto.',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFeedback = () => {
    /* ... Logica Alert Feedback ... */
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

  const handleChangePassword = (e) => {
    /* ... Logica Cambio Password ... */
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

  const handleUpdateAccountInfo = (e) => {
    /* ... Logica Aggiorna Nome/Cognome ... */
    e.preventDefault();
    submitTextUpdate(accountData, 'Informazioni account aggiornate!');
  };

  const handleUpdateProfile = (e) => {
    /* ... Logica Aggiorna Username/Posizione ... */
    e.preventDefault();
    submitTextUpdate(profileData, 'Dettagli profilo aggiornati con successo!');
  };

  const handleDeleteAccount = () => {
    /* ... Logica Disattivazione Account ... */
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
    /* ... Logica Delete Indirizzo ... */
    if (!window.confirm('Eliminare indirizzo?')) return;
    fetch(`${ENDPOINT_INDIRIZZI}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchUserAddresses());
  };

  if (!currentUser) return <Alert variant='danger'>Accesso Negato.</Alert>;

  return (
    <Container className='my-5'>
      <BackButton />
      <h2 className='mb-4 fw-bold'>Impostazioni</h2>
      <Row>
        <Col md={3} className='mb-4'>
          <Card className='border-0' style={{ background: 'transparent' }}>
            <Card.Body className='p-2'>
              <Nav
                variant='pills'
                className='flex-column gap-1'
                activeKey={activeTab}
              >
                {/* Nav Link: Dettagli Profilo */}
                <Nav.Link
                  eventKey='profile'
                  onClick={() => setActiveTab('profile')}
                  className={
                    activeTab === 'profile' ? 'text-white fw-bold' : 'text-dark'
                  }
                  style={
                    activeTab === 'profile'
                      ? { backgroundColor: BRAND_COLOR }
                      : {}
                  }
                >
                  <FaUser className='me-2' /> Dettagli Profilo
                </Nav.Link>
                {/* Nav Link: Impostazioni Account */}
                <Nav.Link
                  eventKey='account'
                  onClick={() => setActiveTab('account')}
                  className={
                    activeTab === 'account' ? 'text-white fw-bold' : 'text-dark'
                  }
                  style={
                    activeTab === 'account'
                      ? { backgroundColor: BRAND_COLOR }
                      : {}
                  }
                >
                  <FaCog className='me-2' /> Impostazioni Account
                </Nav.Link>
                {/* Nav Link: Spedizione */}
                <Nav.Link
                  eventKey='shipping'
                  onClick={() => setActiveTab('shipping')}
                  className={
                    activeTab === 'shipping'
                      ? 'text-white fw-bold'
                      : 'text-dark'
                  }
                  style={
                    activeTab === 'shipping'
                      ? { backgroundColor: BRAND_COLOR }
                      : {}
                  }
                >
                  <FaBoxOpen className='me-2' /> Spedizione
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          {/* VISTE DEL CONTENUTO */}
          {activeTab === 'profile' && (
            <EditProfilePage
              profileData={profileData}
              setProfileData={setProfileData}
              isEditingUsername={isEditingUsername}
              setIsEditingUsername={setIsEditingUsername}
              isLoading={isLoading}
              renderFeedback={renderFeedback}
              handleUpdateProfile={handleUpdateProfile}
              handleUploadAvatar={handleUploadAvatar}
              handleDeleteAvatar={handleDeleteAvatar}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              BRAND_COLOR={BRAND_COLOR}
            />
          )}
          {activeTab === 'account' && (
            <SettingsPage
              accountData={accountData}
              setAccountData={setAccountData}
              passwordData={passwordData}
              setPasswordData={setPasswordData}
              isLoading={isLoading}
              renderFeedback={renderFeedback}
              handleUpdateAccountInfo={handleUpdateAccountInfo}
              handleChangePassword={handleChangePassword}
              handleDeleteAccount={handleDeleteAccount}
              BRAND_COLOR={BRAND_COLOR}
            />
          )}
          {activeTab === 'shipping' && (
            <SettingsAddress
              addresses={addresses}
              loadingAddresses={loadingAddresses}
              isAddingNewAddr={isAddingNewAddr}
              setIsAddingNewAddr={setIsAddingNewAddr}
              handleDeleteAddress={handleDeleteAddress}
              fetchUserAddresses={fetchUserAddresses}
              token={token}
              BRAND_COLOR={BRAND_COLOR}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default DetailsProfile;
