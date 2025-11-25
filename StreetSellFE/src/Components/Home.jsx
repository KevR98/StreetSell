import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const endpoint = 'http://localhost:8888/prodotti';

function Home() {
  const [prodotti, setProdotti] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Resetta lo stato di errore all'inizio del fetch
    setError(null);
    setIsLoading(true);

    // Avvia la catena fetch
    fetch(endpoint)
      .then((res) => {
        // Controlla lo status HTTP
        if (!res.ok) {
          throw new Error(
            `Errore HTTP ${res.status}: Impossibile caricare gli annunci.`
          );
        }
        // Converte la risposta in JSON e passa al prossimo .then()
        return res.json();
      })
      .then((data) => {
        // Estrai la lista di prodotti dal campo 'content' di Spring Page (essenziale!)
        if (data && data.content) {
          setProdotti(data.content);
        } else {
          // Caso di fallback se l'endpoint non usa la paginazione
          setProdotti(data);
        }
      })
      .catch((err) => {
        // Gestisce qualsiasi errore (di rete o lanciato da throw new Error)
        console.error('Errore nel caricamento degli annunci:', err);
        setError(err.message);
      })
      .finally(() => {
        // Esegue questo blocco alla fine, che la chiamata sia andata bene o male
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

  // --- RENDERING FINALE (Il Loop) ---
  return (
    <Container className='my-5'>
      <h1 className='mb-4 text-center'>Novità</h1>

      <Row xs={1} md={2} lg={3} xl={4} className='g-4'>
        {prodotti.map((singoloProdotto) => (
          <Col key={singoloProdotto.id}>
            {/* Passa il singolo prodotto alla Card */}
            <ProductCard prodotto={singoloProdotto} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Home;
