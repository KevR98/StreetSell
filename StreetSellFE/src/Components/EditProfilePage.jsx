import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import avatarDefault from '../assets/streetsell-profile-pic.png'; // AVATAR IMPORTATO

/**
 * Componente per la modifica dei dettagli del profilo utente, inclusi username, posizione e avatar.
 * Le operazioni API (aggiornamento, upload, delete) sono gestite tramite funzioni passate come prop dal genitore.
 */
function EditProfilePage({
  profileData, // Stato dei dati di profilo (username, città, nazione, avatarUrl)
  setProfileData, // Setter per aggiornare lo stato di profileData nel genitore (o nel componente corrente, a seconda dell'architettura)
  isLoading, // Stato di caricamento generale del genitore
  renderFeedback, // Funzione del genitore per visualizzare gli Alert di feedback (successo/errore)
  handleUpdateProfile, // Funzione API del genitore per inviare il PUT dei dati di profilo (username, città, nazione)
  handleUploadAvatar, // Funzione API del genitore per inviare il PATCH del file avatar
  handleDeleteAvatar, // Funzione API del genitore per inviare il DELETE dell'avatar
  selectedFile, // Stato locale del genitore per il file immagine selezionato
  setSelectedFile, // Setter per aggiornare lo stato selectedFile
  brandColor, // Colore principale del brand
}) {
  // Stato locale per controllare se il campo username è in modalità modifica
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // LOGICA AVATAR

  /**
   * Determina l'URL da visualizzare per l'avatar, seguendo la priorità:
   * 1. File selezionato (Blob URL)
   * 2. URL esistente dal backend
   * 3. URL di default (avatarDefault importato)
   */
  const displayAvatarUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : profileData.avatarUrl && profileData.avatarUrl !== 'default'
    ? profileData.avatarUrl
    : avatarDefault; // USA IL TUO IMPORTATO

  /**
   * Controlla se l'utente ha un avatar personalizzato, per mostrare il bottone di eliminazione.
   */
  const hasCustomAvatar =
    profileData.avatarUrl && profileData.avatarUrl !== 'default';

  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  return (
    <Card className='border-0' style={{ background: 'transparent' }}>
      <Card.Body className='p-2 p-md-4'>
        <h4 className='mb-4 fs-4 fs-md-3'>Dettagli Profilo</h4>
        <hr />
        {/* Visualizza l'alert di successo o errore */}
        {renderFeedback()}

        {/* SEZIONE AVATAR */}
        <h5 className='mb-3 fs-5 fs-md-4'>Foto Profilo</h5>

        <div className='d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3'>
          <div className='d-flex align-items-center'>
            {/* Immagine Avatar visualizzata - Utilizza la logica definita per displayAvatarUrl */}
            <img
              src={displayAvatarUrl}
              alt='Avatar'
              className='rounded-circle me-3 me-md-4 border border-1 border-secondary-subtle'
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
              {/* Input file nascosto: modifica lo stato selectedFile all'evento change */}
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
              // Mostra i bottoni per caricare o annullare se è stato selezionato un file
              <>
                <Button
                  style={{
                    backgroundColor: brandColor,
                    borderColor: brandColor,
                  }}
                  size='sm'
                  // Chiama la funzione di upload del genitore
                  onClick={handleUploadAvatar}
                  disabled={isLoading}
                  className='flex-grow-1 flex-md-grow-0 fs-7-custom fs-md-6'
                >
                  {isLoading ? <LoadingSpinner size='sm' /> : 'Carica Foto'}
                </Button>
                <Button
                  variant='outline-danger'
                  size='sm'
                  // Resetta selectedFile a null
                  onClick={() => setSelectedFile(null)}
                  disabled={isLoading}
                  className='flex-grow-1 flex-md-grow-0 fs-7-custom fs-md-6'
                >
                  Annulla
                </Button>
              </>
            ) : (
              // Mostra i bottoni per scegliere una foto o rimuovere l'esistente
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
                    borderColor: brandColor,
                    color: brandColor,
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
                    // Chiama la funzione di eliminazione del genitore
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

        {/* FORM DI AGGIORNAMENTO DATI DI PROFILO */}
        <Form onSubmit={handleUpdateProfile}>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <h5 className='m-0 fs-6 fs-md-5'>Username</h5>
            {/* Bottone per attivare la modifica dell'username */}
            {!isEditingUsername && (
              <Button
                variant='outline-secondary'
                size='sm'
                onClick={() => setIsEditingUsername(true)}
                style={{
                  backgroundColor: 'white',
                  borderColor: brandColor,
                  color: brandColor,
                }}
                className='fs-7-custom fs-md-6'
              >
                Modifica username
              </Button>
            )}
          </div>

          {isEditingUsername ? (
            <div className='d-flex gap-2 align-items-center mb-4'>
              {/* Campo di input per la modifica dell'username */}
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
              {/* Bottone per annullare la modifica dell'username */}
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
            // CORREZIONE USERNAME: Visualizzazione statica con Form.Control disabilitato
            <Form.Control
              type='text'
              readOnly
              disabled
              value={profileData.username}
              style={inputStyle}
              className='py-2 mb-4 fw-bold border fs-7-custom fs-md-6'
            />
          )}

          <hr className='my-4' />

          <h5 className='mb-3 fs-5 fs-md-4'>Posizione</h5>
          <Row>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-7-custom fs-md-6'>Città</Form.Label>
                {/* Campo per la Città: aggiorna profileData su ogni input */}
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
                {/* Campo per la Nazione: aggiorna profileData su ogni input */}
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
            {/* Bottone di Submit: Chiama la funzione handleUpdateProfile del genitore al submit del form */}
            <Button
              style={{ backgroundColor: brandColor, borderColor: brandColor }}
              type='submit'
              disabled={isLoading || selectedFile}
              size='sm'
              className='btn-md-lg fs-7-custom fs-md-6'
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
