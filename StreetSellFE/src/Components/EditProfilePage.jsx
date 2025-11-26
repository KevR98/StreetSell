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
    borderColor: '#ced4da',
  };

  return (
    // Card Trasparente
    <Card className='border-0' style={{ background: 'transparent' }}>
      {/* ✅ PADDING RESPONSIVE */}
      <Card.Body className='p-2 p-md-4'>
        {/* ✅ TITOLO RESPONSIVE */}
        <h4 className='mb-4 fs-4 fs-md-3'>Dettagli Profilo</h4>
        <hr />
        {renderFeedback()}

        {/* SEZIONE AVATAR */}
        <h5 className='mb-3 fs-5 fs-md-4'>Foto Profilo</h5>

        {/* ✅ LAYOUT RESPONSIVE: Impila su mobile (flex-column), riga su desktop (flex-md-row) */}
        <div className='d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3'>
          <div className='d-flex align-items-center'>
            <img
              src={displayAvatarUrl}
              alt='Avatar'
              className='rounded-circle me-3 me-md-4 border border-1 border-secondary-subtle'
              // ✅ AVATAR RESPONSIVE (più piccolo su mobile)
              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
            />
            <div>
              <h5 className='m-0 fw-bold fs-6 fs-md-5'>La tua foto</h5>
              <p className='text-muted small mb-0 fs-7-custom'>
                Formati supportati: JPG, PNG.
              </p>
            </div>
          </div>

          <div className='d-flex gap-2 align-items-center w-100 w-md-auto mt-2 mt-md-0'>
            <Form.Group className='d-none'>
              <Form.Control
                type='file'
                accept='image/*'
                id='file-input-avatar'
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                }}
              />
            </Form.Group>

            {/* Logica Bottoni */}
            {selectedFile ? (
              // 1. Se ho selezionato un file
              <>
                <Button
                  style={{
                    backgroundColor: BRAND_COLOR,
                    borderColor: BRAND_COLOR,
                  }}
                  size='sm'
                  onClick={handleUploadAvatar}
                  disabled={isLoading}
                  className='flex-grow-1 flex-md-grow-0 fs-7-custom fs-md-6'
                >
                  {isLoading ? <LoadingSpinner size='sm' /> : 'Carica Foto'}
                </Button>
                <Button
                  variant='outline-danger'
                  size='sm'
                  onClick={() => setSelectedFile(null)}
                  disabled={isLoading}
                  className='flex-grow-1 flex-md-grow-0 fs-7-custom fs-md-6'
                >
                  Annulla
                </Button>
              </>
            ) : (
              // 2. Se NON ho selezionato file
              <>
                <Button
                  variant='outline-secondary'
                  onClick={() =>
                    document.getElementById('file-input-avatar').click()
                  }
                  disabled={isLoading}
                  size='sm'
                  style={{
                    backgroundColor: 'white',
                    borderColor: BRAND_COLOR,
                    color: BRAND_COLOR,
                  }}
                  className='flex-grow-1 flex-md-grow-0 fs-7-custom fs-md-6'
                >
                  Scegli foto
                </Button>

                {hasCustomAvatar && (
                  <Button
                    variant='outline-danger'
                    size='sm'
                    title='Rimuovi foto profilo'
                    onClick={handleDeleteAvatar}
                    disabled={isLoading}
                    className='fs-7-custom fs-md-6'
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
            <h5 className='m-0 fs-6 fs-md-5'>Username</h5>
            {!isEditingUsername && (
              <Button
                variant='outline-secondary'
                size='sm'
                onClick={() => setIsEditingUsername(true)}
                style={{
                  backgroundColor: 'white',
                  borderColor: BRAND_COLOR,
                  color: BRAND_COLOR,
                }}
                className='fs-7-custom fs-md-6'
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
                style={inputStyle}
                className='fs-7-custom fs-md-6'
              />
              <Button
                variant='link'
                size='sm'
                onClick={() => setIsEditingUsername(false)}
                className='text-danger p-0 fs-7-custom'
              >
                Annulla
              </Button>
            </div>
          ) : (
            <Alert
              style={{ backgroundColor: 'white', borderColor: '#ddd' }}
              className='py-2 mb-4 fw-bold border fs-7-custom fs-md-6'
            >
              {profileData.username}
            </Alert>
          )}

          <hr className='my-4' />

          <h5 className='mb-3 fs-5 fs-md-4'>Posizione</h5>
          <Row>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-7-custom fs-md-6'>Città</Form.Label>
                <Form.Control
                  type='text'
                  value={profileData.citta}
                  placeholder='Es. Milano'
                  onChange={(e) =>
                    setProfileData({ ...profileData, citta: e.target.value })
                  }
                  style={inputStyle}
                  className='fs-7-custom fs-md-6'
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-7-custom fs-md-6'>Nazione</Form.Label>
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
                  style={inputStyle}
                  className='fs-7-custom fs-md-6'
                />
              </Form.Group>
            </Col>
          </Row>

          <div className='text-end mt-4'>
            <Button
              style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR }}
              type='submit'
              disabled={isLoading || selectedFile}
              size='sm' // Base size small
              className='btn-md-lg fs-7-custom fs-md-6' // Classe per ingrandire su desktop se necessario
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
