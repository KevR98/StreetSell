import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Button,
} from 'react-bootstrap';
import ProductCard from './ProductCard';
import BackButton from './BackButton';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'prodotti'; // Default prodotti

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Endpoint dinamico in base al tipo
  const endpoint =
    type === 'prodotti'
      ? `http://localhost:8888/prodotti/cerca?q=${query}`
      : `http://localhost:8888/utenti/cerca?q=${query}`;

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    fetch(endpoint)
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        // Assicuriamoci che data sia sempre un array
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Errore ricerca:', err);
        setResults([]);
        setLoading(false);
      });
  }, [query, type, endpoint]);

  return (
    <Container className='my-5'>
      <BackButton />
      <h2 className='mb-4'>
        Risultati ricerca per: <span className='text-primary'>"{query}"</span>
        <span className='text-muted h5 ms-2'>
          ({type === 'prodotti' ? 'Prodotti' : 'Utenti'})
        </span>
      </h2>

      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' role='status' />
        </div>
      ) : results.length === 0 ? (
        <Alert variant='warning'>Nessun risultato trovato.</Alert>
      ) : (
        <Row xs={1} md={2} lg={4} className='g-4'>
          {results.map((item) => (
            <Col key={item.id}>
              {type === 'prodotti' ? (
                // --- CARD PRODOTTO ---
                <ProductCard prodotto={item} />
              ) : (
                // --- CARD UTENTE ---
                <Card className='h-100 text-center shadow-sm'>
                  <Card.Body className='d-flex flex-column align-items-center justify-content-center'>
                    <div
                      className='rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mb-3'
                      style={{
                        width: '80px',
                        height: '80px',
                        fontSize: '2rem',
                      }}
                    >
                      {(item.username?.charAt(0) || '?').toUpperCase()}
                    </div>
                    <Card.Title>
                      {item.username || 'Utente sconosciuto'}
                    </Card.Title>
                    <Card.Text className='text-muted small'>
                      {item.nome} {item.cognome}
                    </Card.Text>

                    {/* Link al profilo utente (se hai la pagina implementata) */}
                    <Button
                      as={Link}
                      to={`/utenti/${item.id}`}
                      variant='outline-primary'
                      size='sm'
                    >
                      Visita Profilo
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default SearchResults;
