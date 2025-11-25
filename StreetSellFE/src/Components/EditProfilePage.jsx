import React from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import defaultAvatar from '../assets/streetsell-profile-pic.png';

function EditProfilePage({
  profileData,
  setProfileData,
  isEditingUsername,
  setIsEditingUsername,
  isLoading,
  renderFeedback,
  handleUpdateProfile,
  handleUploadAvatar,
  handleDeleteAvatar,
  selectedFile,
  setSelectedFile,
  BRAND_COLOR,
}) {
  // Logica visualizzazione: File Selezionato > URL Backend > Default
  const displayAvatarUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : profileData.avatarUrl && profileData.avatarUrl !== 'default'
    ? profileData.avatarUrl
    : defaultAvatar;

  // Condizione per mostrare il cestino
  const hasCustomAvatar =
    profileData.avatarUrl && profileData.avatarUrl !== 'default';

  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da', // Colore standard Bootstrap per il bordo
  };

  return (
    // Card Trasparente (come richiesto)
    <Card className='border-0' style={{ background: 'transparent' }}>
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
                  // La logica setFeedback('') è nel Contenitore
                }}
              />
            </Form.Group>

            {/* Logica Bottoni */}
            {selectedFile ? (
              // 1. Se ho selezionato un file: MOSTRA "Carica" e "Annulla"
              <>
                <Button
                  style={{
                    backgroundColor: BRAND_COLOR,
                    borderColor: BRAND_COLOR,
                  }}
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
              // 2. Se NON ho selezionato file: MOSTRA "Scegli" e "Rimuovi"
              <>
                <Button
                  variant='outline-secondary'
                  onClick={() =>
                    document.getElementById('file-input-avatar').click()
                  }
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'white',
                    borderColor: BRAND_COLOR,
                    color: BRAND_COLOR,
                  }}
                >
                  Scegli foto
                </Button>

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
                  borderColor: BRAND_COLOR,
                  color: BRAND_COLOR,
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
                // ✅ Sfondo bianco per Input
                style={inputStyle}
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
              // ✅ Sfondo e Bordo espliciti
              style={{ backgroundColor: 'white', borderColor: '#ddd' }}
              className='py-2 mb-4 fw-bold border'
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
                  // ✅ Sfondo bianco per Input
                  style={inputStyle}
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
                  // ✅ Sfondo bianco per Input
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className='text-end mt-4'>
            <Button
              style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR }}
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
}

export default EditProfilePage;
