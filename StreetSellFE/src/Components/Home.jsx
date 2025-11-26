import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const endpoint = 'http://localhost:8888/prodotti';

function Home() {
  const [prodotti, setProdotti] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setIsLoading(true);

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Errore HTTP ${res.status}: Impossibile caricare gli annunci.`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.content) {
          setProdotti(data.content);
        } else {
          setProdotti(data);
        }
      })
      .catch((err) => {
        console.error('Errore nel caricamento degli annunci:', err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Container className='text-center my-5'>
        <Spinner animation='border' variant='primary' />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='my-5'>
        <Alert variant='danger'>Errore: {error}</Alert>
      </Container>
    );
  }

  if (prodotti.length === 0) {
    return (
      <Container className='my-5'>
        <Alert variant='info'>Nessun annuncio trovato.</Alert>
      </Container>
    );
  }

  // --- RENDERING FINALE ---
  return (
    <Container className='my-5'>
      <h1 className='mb-4 text-center'>Novità</h1>

      {/* ✅ MODIFICA QUI:
        xs={2} -> 2 colonne su Mobile (Extra Small e Small)
        md={3} -> 3 colonne su Tablet (Medium)
        lg={4} -> 4 colonne su Desktop (Large)
        xl={5} -> 5 colonne su Schermi molto grandi (Extra Large)
      */}
      <Row xs={2} md={3} lg={4} xl={5} className='g-3'>
        {prodotti.map((singoloProdotto) => (
          <Col key={singoloProdotto.id}>
            <ProductCard prodotto={singoloProdotto} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Home;
