import { useState, useEffect } from 'react';
import { Container, Card, Nav, Row, Col, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaCog, FaBoxOpen } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import BackButton from './BackButton';

// Importazione dei componenti figli per le diverse tab
import EditProfilePage from './EditProfilePage';
import SettingsPage from './SettingsPage';
import SettingsAddress from './SettingsAddress';

// Colore del brand per gli elementi UI
const brandColor = '#fa8229'; // Rinominate BRAND_COLOR in brandColor

// Endpoint API
const endpointMe = 'http://localhost:8888/utenti/me'; // Rinominate ENDPOINT_ME in endpointMe
const endpointPassword = 'http://localhost:8888/utenti/me/password'; // Rinominate ENDPOINT_PASSWORD in endpointPassword
const endpointIndirizzi = 'http://localhost:8888/indirizzi'; // Rinominate ENDPOINT_INDIRIZZI in endpointIndirizzi
const endpointAvatar = 'http://localhost:8888/utenti/me/avatar'; // Rinominate ENDPOINT_AVATAR in endpointAvatar

function DetailsProfile() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('accessToken');
  // Recupero l'utente corrente dallo stato Redux
  const currentUser = useSelector((state) => state.auth.user);

  // --- STATI PRINCIPALI ---

  // Stato che gestisce quale tab (sezione) è attualmente attiva
  const [activeTab, setActiveTab] = useState('profile');
  // Stato generale di caricamento per le operazioni di submit
  const [isLoading, setIsLoading] = useState(false);
  // Stato per i messaggi di feedback all'utente (successo/errore)
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  // Stato per l'immagine avatar selezionata ma non ancora caricata
  const [selectedFile, setSelectedFile] = useState(null);

  // Dati di Profilo (usati principalmente per l'avatar e i campi mostrati nella prima tab)
  const [profileData, setProfileData] = useState({
    username: currentUser?.username || '',
    citta: currentUser?.citta || '',
    nazione: currentUser?.nazione || '',
    avatarUrl: currentUser?.avatarUrl || '',
  });

  // STATI INDIRIZZI (usati nella tab 'shipping')
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);

  // --- EFFETTI E LOGICHE ---

  // Aggiorna gli stati locali quando i dati di Redux cambiano (es. dopo un update)
  useEffect(() => {
    if (currentUser) {
      setProfileData((prev) => ({
        ...prev,
        username: currentUser.username || '',
        citta: currentUser.citta || '',
        nazione: currentUser.nazione || '',
        avatarUrl: currentUser.avatarUrl || '',
      }));
    }
  }, [currentUser]);

  // Carica gli indirizzi solo quando si seleziona la tab 'shipping'
  useEffect(() => {
    if (activeTab === 'shipping') {
      fetchUserAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /**
   * Fetcha gli indirizzi di spedizione dell'utente.
   */
  const fetchUserAddresses = () => {
    setLoadingAddresses(true);
    // Uso endpointIndirizzi
    fetch(endpointIndirizzi, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAddresses(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingAddresses(false));
  };

  /**
   * Funzione generica per inviare aggiornamenti PUT (dati di profilo, info account, etc.) in formato JSON.
   */
  const submitTextUpdate = (payload, successMsg) => {
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    // Uso endpointMe
    fetch(endpointMe, {
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
          // Sollevo un errore con il messaggio specifico dal backend
          throw new Error(err.message || 'Errore aggiornamento');
        }
        return res.json();
      })
      .then((updatedUser) => {
        setFeedback({ type: 'success', message: successMsg });
        // Aggiorno lo stato globale con i nuovi dati dell'utente
        dispatch({ type: 'SET_USER', payload: updatedUser });
      })
      .catch((err) => setFeedback({ type: 'danger', message: err.message }))
      .finally(() => setIsLoading(false));
  };

  /**
   * Gestisce l'upload di un nuovo avatar tramite richiesta PATCH Multipart.
   */
  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    const formData = new FormData();
    formData.append('avatar', selectedFile);
    try {
      // Uso endpointAvatar
      const res = await fetch(endpointAvatar, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }, // NO Content-Type per FormData
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Errore server: ${res.status} - ${errorText}`);
      }
      const updatedUser = await res.json();
      setFeedback({ type: 'success', message: 'Foto profilo aggiornata!' });
      // Aggiorno lo stato locale e Redux
      setProfileData((prev) => ({ ...prev, avatarUrl: updatedUser.avatarUrl }));
      dispatch({ type: 'SET_USER', payload: updatedUser });
      setSelectedFile(null); // Resetto il file selezionato
    } catch (err) {
      console.error('Errore upload:', err);
      setFeedback({ type: 'danger', message: 'Errore caricamento foto.' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gestisce la rimozione dell'avatar tramite richiesta DELETE.
   */
  const handleDeleteAvatar = async () => {
    if (!window.confirm('Vuoi davvero rimuovere la foto profilo?')) return;
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      // Uso endpointAvatar
      const res = await fetch(endpointAvatar, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Errore durante la rimozione.');
      const updatedUser = await res.json();
      setFeedback({
        message: 'Foto rimossa. Ripristinato default.',
        type: 'success',
      });
      // Aggiorno lo stato locale e Redux con il nuovo URL (probabilmente un placeholder)
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

  /**
   * Componente per renderizzare l'Alert di feedback.
   */
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

  /**
   * Gestisce il cambio password.
   * @param {object} passwordData - L'oggetto contenente oldPassword e newPassword.
   */
  const handleChangePassword = (e, passwordData) => {
    e.preventDefault();

    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    // Uso endpointPassword
    fetch(endpointPassword, {
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
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Impossibile cambiare password');
        }
        setFeedback({ type: 'success', message: 'Password cambiata!' });
      })
      .catch((err) => setFeedback({ type: 'danger', message: err.message }))
      .finally(() => setIsLoading(false));
  };

  /**
   * Funzione per aggiornare le info account (nome, cognome).
   * @param {object} accountData - L'oggetto con nome e cognome.
   */
  const handleUpdateAccountInfo = (e, accountData) => {
    e.preventDefault();
    submitTextUpdate(accountData, 'Informazioni account aggiornate!');
  };

  /**
   * Funzione per aggiornare i dati di profilo (username, città, nazione).
   */
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    submitTextUpdate(profileData, 'Dettagli profilo aggiornati con successo!');
  };

  /**
   * Gestisce la cancellazione definitiva dell'account utente.
   */
  const handleDeleteAccount = () => {
    if (window.confirm('SEI SICURO? Azione irreversibile.')) {
      // Uso endpointMe
      fetch(endpointMe, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Errore cancellazione');
          alert('Account eliminato.');
          // Pulizia e reindirizzamento al login
          localStorage.clear();
          window.location.href = '/login';
        })
        .catch((err) => alert(err.message));
    }
  };

  /**
   * Gestisce l'eliminazione di un singolo indirizzo.
   */
  const handleDeleteAddress = (id) => {
    if (!window.confirm('Eliminare indirizzo?')) return;
    // Uso endpointIndirizzi
    fetch(`${endpointIndirizzi}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchUserAddresses()); // Ricarico la lista degli indirizzi dopo la cancellazione
  };

  // Se l'utente non è ancora caricato o loggato
  if (!currentUser) return <Alert variant='danger'>Accesso Negato.</Alert>;

  return (
    <Container className='my-5'>
      <BackButton />
      <h2 className='mb-3 fs-3 fs-md-2 fw-bold'>Impostazioni</h2>

      <Row>
        {/* === COLONNA NAVIGAZIONE (XS=12, MD=3) === */}
        <Col xs={12} md={3} className='mb-4'>
          <Card className='border-0' style={{ background: 'transparent' }}>
            <Card.Body className='p-0 p-md-2'>
              <Nav
                variant='pills'
                className='flex-column gap-2 mb-3 mb-md-0'
                activeKey={activeTab}
              >
                {/* Nav Link: Dettagli Profilo */}
                <Nav.Link
                  eventKey='profile'
                  onClick={() => setActiveTab('profile')}
                  className={`w-100 text-start ${
                    activeTab === 'profile'
                      ? 'text-white fw-bold fs-7-custom'
                      : 'text-dark fs-7-custom'
                  }`}
                  style={
                    activeTab === 'profile'
                      ? { backgroundColor: brandColor } // Usato brandColor
                      : { backgroundColor: 'white', border: '1px solid #eee' }
                  }
                >
                  <FaUser className='me-2' /> Dettagli Profilo
                </Nav.Link>

                {/* Nav Link: Impostazioni Account */}
                <Nav.Link
                  eventKey='account'
                  onClick={() => setActiveTab('account')}
                  className={`w-100 text-start ${
                    activeTab === 'account'
                      ? 'text-white fw-bold fs-7-custom'
                      : 'text-dark fs-7-custom'
                  }`}
                  style={
                    activeTab === 'account'
                      ? { backgroundColor: brandColor } // Usato brandColor
                      : { backgroundColor: 'white', border: '1px solid #eee' }
                  }
                >
                  <FaCog className='me-2' /> Impostazioni Account
                </Nav.Link>

                {/* Nav Link: Spedizione */}
                <Nav.Link
                  eventKey='shipping'
                  onClick={() => setActiveTab('shipping')}
                  className={`w-100 text-start ${
                    activeTab === 'shipping'
                      ? 'text-white fw-bold fs-7-custom'
                      : 'text-dark fs-7-custom'
                  }`}
                  style={
                    activeTab === 'shipping'
                      ? { backgroundColor: brandColor } // Usato brandColor
                      : { backgroundColor: 'white', border: '1px solid #eee' }
                  }
                >
                  <FaBoxOpen className='me-2' /> Spedizione
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* === COLONNA CONTENUTO (XS=12, MD=9) === */}
        <Col xs={12} md={9}>
          {activeTab === 'profile' && (
            <EditProfilePage
              // Dati di stato e setter
              profileData={profileData}
              setProfileData={setProfileData}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              // Funzioni (API)
              handleUpdateProfile={handleUpdateProfile}
              handleUploadAvatar={handleUploadAvatar}
              handleDeleteAvatar={handleDeleteAvatar}
              // Stati e utilities
              isLoading={isLoading}
              renderFeedback={renderFeedback}
              brandColor={brandColor} // Usato brandColor
            />
          )}
          {activeTab === 'account' && (
            <SettingsPage
              // Dato per la gestione del form (passo l'utente corrente per i valori iniziali)
              currentUser={currentUser}
              // Funzioni (API)
              handleUpdateAccountInfo={handleUpdateAccountInfo}
              handleChangePassword={handleChangePassword}
              handleDeleteAccount={handleDeleteAccount}
              // Stati e utilities
              isLoading={isLoading}
              renderFeedback={renderFeedback}
              brandColor={brandColor} // Usato brandColor
            />
          )}
          {activeTab === 'shipping' && (
            <SettingsAddress
              // Dati di stato e setter
              addresses={addresses}
              loadingAddresses={loadingAddresses}
              isAddingNewAddr={isAddingNewAddr}
              setIsAddingNewAddr={setIsAddingNewAddr}
              // Funzioni (API)
              handleDeleteAddress={handleDeleteAddress}
              fetchUserAddresses={fetchUserAddresses}
              token={token}
              brandColor={brandColor} // Usato brandColor
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default DetailsProfile;
