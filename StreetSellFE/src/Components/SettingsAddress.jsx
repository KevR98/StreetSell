import React from 'react';
import { Card, Button, ListGroup, Alert, Badge } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import Indirizzo from './Indirizzo'; // Assicurati che Indirizzo sia importabile

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
      <Card.Body className='p-4'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h4 className='m-0'>Indirizzi di Spedizione</h4>
          {!isAddingNewAddr && (
            <Button
              // ✅ Primary Button
              style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR }}
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
}

export default SettingsAddress;
