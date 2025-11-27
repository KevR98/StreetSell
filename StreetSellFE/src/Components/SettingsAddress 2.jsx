import React from 'react';
import { Card, Button, ListGroup, Alert, Badge } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import Indirizzo from './Indirizzo';

function SettingsAddress({
  addresses,
  loadingAddresses,
  isAddingNewAddr,
  setIsAddingNewAddr,
  handleDeleteAddress,
  fetchUserAddresses,
  token,
  BRAND_COLOR,
}) {
  return (
    <Card className='border-0' style={{ background: 'transparent' }}>
      {/* ✅ PADDING RESPONSIVE: p-2 su mobile, p-4 su desktop */}
      <Card.Body className='p-2 p-md-4'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          {/* ✅ TITOLO RESPONSIVE */}
          <h4 className='m-0 fs-5 fs-md-4'>Indirizzi di Spedizione</h4>

          {!isAddingNewAddr && (
            <Button
              style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR }}
              size='sm'
              // ✅ FONT BOTTONE RESPONSIVE
              className='fs-7-custom fs-md-6'
              onClick={() => setIsAddingNewAddr(true)}
            >
              + Aggiungi Nuovo
            </Button>
          )}
        </div>

        {loadingAddresses && <LoadingSpinner />}

        {isAddingNewAddr ? (
          <div className='bg-light p-3 rounded'>
            {/* ✅ TITOLO SOTTO-SEZIONE RESPONSIVE */}
            <h5 className='mb-3 fs-6 fs-md-5'>Nuovo Indirizzo</h5>
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
                  // ✅ PADDING LISTA RESPONSIVE (px-0 su mobile per guadagnare spazio)
                  className='d-flex justify-content-between align-items-center py-3 px-0 px-md-3'
                  style={{ backgroundColor: 'transparent' }}
                >
                  <div className='me-2'>
                    {/* ✅ VIA/CIVICO RESPONSIVE */}
                    <div className='fw-bold fs-7-custom fs-md-6'>
                      {addr.via}, {addr.civico}
                    </div>

                    {/* ✅ CITTA/CAP RESPONSIVE */}
                    <div className='text-muted fs-8-custom fs-md-7'>
                      {addr.cap} {addr.citta} ({addr.provincia}), {addr.nazione}
                    </div>

                    {addr.isDefault && (
                      <Badge bg='success' className='mt-1 fs-8-custom'>
                        Predefinito
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant='outline-danger'
                    size='sm'
                    onClick={() => handleDeleteAddress(addr.id)}
                    className='d-flex align-items-center justify-content-center'
                    style={{ height: '32px', width: '32px' }} // Bottone quadrato compatto
                  >
                    <FaTrash size={12} />
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <Alert variant='info' className='fs-7-custom fs-md-6'>
                Non hai ancora salvato nessun indirizzo.
              </Alert>
            )}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

export default SettingsAddress;
