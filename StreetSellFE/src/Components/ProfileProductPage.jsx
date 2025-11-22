import { useEffect, useState } from 'react';
// Importa i componenti Bootstrap qui sotto
import { Card, Container, Row, Col, Alert, Button } from 'react-bootstrap';

// 🚨 CORREZIONE: Link DEVE venire da react-router-dom 🚨
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import BackButton from './BackButton';

const endpoint = 'http://localhost:8888/prodotti/me';

function ProfileProductPage() {
  const [prodotti, setProdotti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError(
        'Devi essere loggato per accedere alla dashboard. Reindirizzamento'
      );

      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    const getDetail = () => {
      setLoading(true);
      setError(null);

      fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Errore nel caricamento');
          }
        })

        .then((prodotto) => {
          setProdotti(prodotto.content);
          setLoading(false);
        })

        .catch((err) => {
          console.error('Errore nel caricamento:', err);
          setError(err.message || 'Si è verificato un errore sconosciuto.'); // ✅ IMPOSTA IL MESSAGGIO DI ERRORE
          setLoading(false);
        });
    };
    getDetail();
  }, [token, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert />;
  return (
    <Container className='mt-5'>
      <BackButton />

      <h2>I Tuoi Prodotti in Vendita</h2>
      <hr />

      {prodotti.length === 0 ? (
        <Alert variant='info' className='text-center'>
          Non hai ancora messo in vendita alcun prodotto.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className='g-4'>
          {prodotti.map((prodotto) => (
            // Usa il componente Card che probabilmente hai già per la Home Page
            <Col key={prodotto.id}>
              <Card>
                <Card.Img
                  variant='top'
                  src={prodotto.immagini[0]?.url || 'placeholder.jpg'} // Usa la prima immagine
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{prodotto.titolo}</Card.Title>
                  <Card.Text>
                    <strong>€ {prodotto.prezzo.toFixed(2)}</strong>
                    <br />
                    Stato: {prodotto.statoProdotto}
                  </Card.Text>
                  {/* Link per la modifica/visualizzazione dettagliata (da implementare) */}
                  <Button
                    as={Link}
                    to={`/prodotto/${prodotto.id}`}
                    variant='primary'
                    className='mt-auto'
                  >
                    Vedi Dettagli
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default ProfileProductPage;
