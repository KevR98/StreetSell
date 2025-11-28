import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Button,
  Form,
  FormControl,
  InputGroup,
} from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import ProductCard from './ProductCard';
import BackButton from './BackButton';

const brandColor = '#fa8229';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Recupero la query e il tipo dall'URL
  const rawQuery = searchParams.get('q');
  const searchQuery = rawQuery ? rawQuery.toLowerCase() : '';
  const type = searchParams.get('type') || 'all';

  // Stati per i risultati
  const [productsResults, setProductsResults] = useState([]);
  const [usersResults, setUsersResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stati locali per la barra di ricerca interna (per permettere la modifica)
  const [currentQuery, setCurrentQuery] = useState(rawQuery || '');
  const [currentSearchType, setCurrentSearchType] = useState(type);

  /**
   * Gestisce l'invio del form di ricerca interno, aggiornando l'URL.
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (currentQuery.trim() !== '') {
      // Naviga alla nuova URL, innescando useEffect
      navigate(`/cerca?q=${currentQuery}&type=${currentSearchType}`);
    }
  };

  /**
   * Effetto: Esegue il fetch dei dati ogni volta che cambiano la query o il tipo nell'URL.
   */
  useEffect(() => {
    // Sincronizza lo stato locale con i parametri URL in caso di navigazione esterna
    setCurrentQuery(rawQuery || '');
    setCurrentSearchType(type);

    if (!searchQuery) {
      setProductsResults([]);
      setUsersResults([]);
      return;
    }

    setLoading(true);

    // Definizione delle promesse di fetch
    const fetchProducts = fetch(
      `http://localhost:8888/prodotti/cerca?q=${searchQuery}`
    ).then((res) => (res.ok ? res.json() : []));
    const fetchUsers = fetch(
      `http://localhost:8888/utenti/cerca?q=${searchQuery}`
    ).then((res) => (res.ok ? res.json() : []));

    if (type === 'prodotti') {
      // Ricerca solo Prodotti
      fetchProducts
        .then((data) => {
          setProductsResults(data);
          setUsersResults([]);
        })
        .finally(() => setLoading(false));
    } else if (type === 'utenti') {
      // Ricerca solo Utenti
      fetchUsers
        .then((data) => {
          setUsersResults(data);
          setProductsResults([]);
        })
        .finally(() => setLoading(false));
    } else {
      // CASO 'all' (Ricerca Universale)
      Promise.all([fetchProducts, fetchUsers])
        .then(([prodData, userData]) => {
          setProductsResults(prodData);
          setUsersResults(userData);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
    // searchParams è incluso nelle dipendenze per coerenza, sebbene rawQuery e type siano sufficienti
  }, [searchQuery, type, rawQuery, searchParams, navigate]);

  // Variabile per determinare se non ci sono risultati
  const noResultsFound =
    !loading &&
    searchQuery &&
    (type === 'all'
      ? productsResults.length === 0 && usersResults.length === 0
      : type === 'prodotti'
      ? productsResults.length === 0
      : usersResults.length === 0);

  return (
    <Container className='mt-3 mb-5 pb-5'>
      <BackButton />

      {/* BARRA DI RICERCA INTERNA */}
      <div className='mb-4 mt-2'>
        <Form onSubmit={handleSearchSubmit}>
          <InputGroup>
            {/* Selettore tipo di ricerca (visibile solo su desktop) */}
            <Form.Select
              className='d-none d-sm-block'
              value={currentSearchType}
              onChange={(e) => setCurrentSearchType(e.target.value)}
              style={{
                maxWidth: '110px',
                backgroundColor: '#f8f9fa',
              }}
            >
              <option value='prodotti'>Prodotti</option>
              <option value='utenti'>Utenti</option>
              {/* Opzione nascosta per gestire lo stato 'all' senza visualizzarlo */}
              <option value='all' style={{ display: 'none' }}>
                Tutti
              </option>
            </Form.Select>

            <FormControl
              type='search'
              placeholder='Cerca di nuovo...'
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
            />
            <Button
              type='submit'
              style={{
                backgroundColor: brandColor,
                borderColor: brandColor,
              }}
            >
              <BsSearch />
            </Button>
          </InputGroup>
        </Form>
      </div>

      {/* Intestazione Risultati */}
      {searchQuery && (
        <h2 className='mb-4 fs-4'>
          Risultati per:{' '}
          <span className='fw-bold text-primary'>{rawQuery}</span>
        </h2>
      )}

      {/* Spinner di Caricamento */}
      {loading && (
        <div className='text-center mt-5'>
          <Spinner animation='border' variant='primary' />
        </div>
      )}

      {/* Nessun Risultato */}
      {noResultsFound && (
        <Alert variant='warning'>
          Nessun risultato trovato per "{rawQuery}".
        </Alert>
      )}

      {/* RISULTATI PRODOTTI */}
      {!loading &&
        productsResults.length > 0 &&
        (type === 'prodotti' || type === 'all') && (
          <div className='mb-5'>
            {/* Titolo Sotto-Sezione se la ricerca è universale */}
            {type === 'all' && (
              <h4 className='mb-3 border-bottom pb-2'>Prodotti</h4>
            )}
            <Row xs={2} md={3} lg={4} className='g-3'>
              {productsResults.map((prodotto) => (
                <Col key={prodotto.id}>
                  <ProductCard prodotto={prodotto} />
                </Col>
              ))}
            </Row>
          </div>
        )}

      {/* RISULTATI UTENTI */}
      {!loading &&
        usersResults.length > 0 &&
        (type === 'utenti' || type === 'all') && (
          <div>
            {/* Titolo Sotto-Sezione se la ricerca è universale */}
            {type === 'all' && (
              <h4 className='mb-3 border-bottom pb-2'>Utenti</h4>
            )}
            <Row xs={2} md={3} lg={4} className='g-3'>
              {usersResults.map((item) => (
                <Col key={item.id}>
                  <Card className='h-100 shadow-sm border-0 text-center p-2'>
                    <div className='mx-auto mt-2'>
                      {/* Avatar placeholder con iniziale */}
                      <div
                        className='rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary fw-bold'
                        style={{
                          width: '60px',
                          height: '60px',
                          fontSize: '1.5rem',
                        }}
                      >
                        {(item.username?.charAt(0) || '?').toUpperCase()}
                      </div>
                    </div>
                    <Card.Body className='p-2'>
                      <Card.Title className='fs-6 mb-1 text-truncate'>
                        {item.username}
                      </Card.Title>
                      <Card.Text className='text-muted small mb-2'>
                        {item.nome} {item.cognome}
                      </Card.Text>
                      <Button
                        as={Link}
                        to={`/utenti/${item.id}`}
                        variant='outline-warning'
                        size='sm'
                        className='w-100 rounded-pill'
                        style={{ fontSize: '0.75rem' }}
                      >
                        Profilo
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
    </Container>
  );
}

export default SearchResults;
