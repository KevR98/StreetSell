import { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import {
  FaKey,
  FaExclamationTriangle,
  FaEyeSlash,
  FaEye,
} from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

/* Componente per la gestione delle impostazioni dell'account (anagrafica, password, eliminazione) */
function SettingsPage({
  currentUser,
  isLoading,
  renderFeedback,
  handleUpdateAccountInfo,
  handleChangePassword,
  handleDeleteAccount,
  brandColor, // Rinominate BRAND_COLOR in brandColor
}) {
  // Stati locali per i form (gestiti qui per isolare la logica di input)
  const [accountData, setAccountData] = useState({
    nome: currentUser?.nome || '',
    cognome: currentUser?.cognome || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Stati locali per la visibilità della password
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Stili fissi
  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  const eyeButtonStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
    color: '#495057',
  };

  // Stile base per il bottone outline del Brand
  const brandOutlineStyle = {
    backgroundColor: 'transparent',
    borderColor: brandColor,
    color: brandColor,
    transition: 'background-color 0.2s',
  };

  /**
   * Wrapper per l'aggiornamento dell'anagrafica, passa i dati locali al gestore del genitore.
   */
  const handleUpdateInfoWrapper = (e) => {
    // Passa l'evento e l'oggetto dati al gestore API del genitore
    handleUpdateAccountInfo(e, accountData);
  };

  /**
   * Wrapper per la gestione del cambio password, aggiunge la validazione di corrispondenza.
   */
  const handleChangePasswordWrapper = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      // Se non corrispondono, il messaggio di errore è già visibile tramite Form.Text.
      return;
    }
    // Passa l'evento e l'oggetto dati al gestore API del genitore
    handleChangePassword(e, passwordData);

    // Pulisce i campi password dopo l'invio (indipendentemente dal successo)
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  };

  return (
    <Card className='border-0' style={{ background: 'transparent' }}>
      <Card.Body className='p-2 p-md-4'>
        {/* Titolo Principale */}
        <h4 className='mb-4 fs-4 fs-md-3'>Impostazioni dell'Account</h4>

        {renderFeedback()}

        {/* Sezione Anagrafica (Nome e Cognome) */}
        <h6 className='text-muted text-uppercase small ls-1 mb-3 fs-7-custom fs-md-6'>
          Anagrafica
        </h6>
        <Form onSubmit={handleUpdateInfoWrapper} className='mb-5'>
          <Row>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-7-custom fs-md-6'>Nome</Form.Label>
                <Form.Control
                  type='text'
                  value={accountData.nome}
                  onChange={(e) =>
                    setAccountData({ ...accountData, nome: e.target.value })
                  }
                  style={inputStyle}
                  className='fs-7-custom fs-md-6'
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-7-custom fs-md-6'>Cognome</Form.Label>
                <Form.Control
                  type='text'
                  value={accountData.cognome}
                  onChange={(e) =>
                    setAccountData({ ...accountData, cognome: e.target.value })
                  }
                  style={inputStyle}
                  className='fs-7-custom fs-md-6'
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            size='sm'
            type='submit'
            disabled={isLoading}
            style={brandOutlineStyle}
            className='fs-7-custom fs-md-6'
          >
            Aggiorna
          </Button>
        </Form>

        <hr />

        {/* Sezione Sicurezza (Cambio Password) */}
        <h6 className='text-muted text-uppercase small ls-1 mb-3 mt-4 fs-7-custom fs-md-6'>
          Sicurezza
        </h6>
        <Form onSubmit={handleChangePasswordWrapper} className='mb-5'>
          {/* Vecchia Password */}
          <Form.Group className='mb-3'>
            <Form.Label className='fs-7-custom fs-md-6'>
              Vecchia Password
            </Form.Label>
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
                style={inputStyle}
                className='fs-7-custom fs-md-6'
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowOldPass(!showOldPass)}
                style={eyeButtonStyle}
                className='d-flex align-items-center'
              >
                {showOldPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          {/* Nuova Password */}
          <Form.Group className='mb-3'>
            <Form.Label className='fs-7-custom fs-md-6'>
              Nuova Password
            </Form.Label>
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
                style={inputStyle}
                className='fs-7-custom fs-md-6'
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowNewPass(!showNewPass)}
                style={eyeButtonStyle}
                className='d-flex align-items-center'
              >
                {showNewPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          {/* Conferma Nuova Password */}
          <Form.Group className='mb-4'>
            <Form.Label className='fs-7-custom fs-md-6'>
              Conferma Nuova Password
            </Form.Label>
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
                style={inputStyle}
                className='fs-7-custom fs-md-6'
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={eyeButtonStyle}
                className='d-flex align-items-center'
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            {/* Validazione frontend: mostra avviso se le password non corrispondono */}
            {passwordData.newPassword !== passwordData.confirmNewPassword &&
              passwordData.confirmNewPassword.length > 0 && (
                <Form.Text className='text-danger fs-8-custom'>
                  Le password non corrispondono.
                </Form.Text>
              )}
          </Form.Group>

          {/* Bottone Cambia Password */}
          <Button
            size='sm'
            type='submit'
            disabled={
              isLoading ||
              passwordData.newPassword !== passwordData.confirmNewPassword ||
              passwordData.newPassword.length === 0 // Disabilita se la nuova password è vuota
            }
            style={brandOutlineStyle}
            className='fs-7-custom fs-md-6'
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

        {/* Zona Pericolo (Eliminazione Account) */}
        <div className='bg-danger-subtle p-3 rounded border border-danger'>
          <h6 className='text-danger fw-bold fs-7-custom fs-md-6'>
            <FaExclamationTriangle className='me-1' /> Zona Pericolo
          </h6>
          <p className='small text-muted mb-2 fs-7-custom'>
            Una volta cancellato l'account, non è possibile tornare indietro.
          </p>
          <Button
            variant='danger'
            size='sm'
            onClick={handleDeleteAccount}
            className='fs-7-custom'
          >
            Elimina Account
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SettingsPage;
