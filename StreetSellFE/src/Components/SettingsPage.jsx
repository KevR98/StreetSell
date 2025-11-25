import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import {
  FaKey,
  FaExclamationTriangle,
  FaEyeSlash,
  FaEye,
} from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

function SettingsPage({
  accountData,
  setAccountData,
  passwordData,
  setPasswordData,
  isLoading,
  renderFeedback,
  handleUpdateAccountInfo,
  handleChangePassword,
  handleDeleteAccount,
  BRAND_COLOR,
}) {
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  const eyeButtonStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
    color: '#495057',
  };

  // Stile base per il bottone outline del Brand (per eliminare il grigio di default)
  const brandOutlineStyle = {
    backgroundColor: 'transparent',
    borderColor: BRAND_COLOR,
    color: BRAND_COLOR,
    // Aggiungiamo un hover/active effect più neutro (opzionale, ma mantiene la coerenza)
    transition: 'background-color 0.2s',
  };

  return (
    <Card className='border-0' style={{ background: 'transparent' }}>
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
                  style={inputStyle}
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
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            // ✅ RIMOSSO variant='outline-secondary' per evitare CSS di hover di default
            size='sm'
            type='submit'
            disabled={isLoading}
            style={brandOutlineStyle} // Utilizza lo stile custom
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
                style={inputStyle}
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowOldPass(!showOldPass)}
                style={eyeButtonStyle}
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
                style={inputStyle}
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowNewPass(!showNewPass)}
                style={eyeButtonStyle}
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
                style={inputStyle}
              />
              <Button
                variant='outline-secondary'
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={eyeButtonStyle}
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
            // ✅ RIMOSSO variant='outline-dark' per evitare CSS di hover di default
            size='sm'
            type='submit'
            disabled={
              isLoading ||
              passwordData.newPassword !== passwordData.confirmNewPassword
            }
            style={brandOutlineStyle} // Utilizza lo stile custom
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
}

export default SettingsPage;
