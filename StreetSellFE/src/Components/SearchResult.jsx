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

const brandColor = '#fa8229';

function SearchResults() {
  const [searchParams] = useSearchParams();

  // Variabile per la visualizzazione (mantiene la capitalizzazione originale)
  const rawQuery = searchParams.get('q');

  // ✅ Variabile inviata all'API (forzata in minuscolo per case-insensitivity)
  const searchQuery = rawQuery ? rawQuery.toLowerCase() : '';

  const type = searchParams.get('type') || 'prodotti'; // Default prodotti

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Endpoint dinamico in base al tipo. Usa searchQuery.
  const endpoint =
    type === 'prodotti'
      ? `http://localhost:8888/prodotti/cerca?q=${searchQuery}`
      : `http://localhost:8888/utenti/cerca?q=${searchQuery}`;

  useEffect(() => {
    // Usiamo searchQuery per evitare fetch inutili
    if (!searchQuery) return;

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
  }, [searchQuery, type, endpoint]); // Aggiornate le dipendenze

  return (
    <Container className='my-5'>
      <BackButton />
      <h2 className='mb-4'>
        {/* Usiamo rawQuery per mostrare all'utente il termine originale */}
        Risultati ricerca per: <span className='color'>"{rawQuery}"</span>
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
                <Card
                  className='h-100 text-center border-0'
                  style={{ backgroundColor: 'transparent' }}
                >
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
                      style={{
                        backgroundColor: brandColor,
                        borderColor: brandColor,
                      }}
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
