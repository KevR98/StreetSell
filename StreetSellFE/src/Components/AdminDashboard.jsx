import { Alert, Col, Container, Row } from 'react-bootstrap';

function AdminDashboard() {
  return (
    <Container>
      <Row>
        <Col>
          <h1 className='text-center mb-4'>Pannello di Amministrazione</h1>
          <Alert variant='danger'>
            ⚠️ Benvenuto Amministratore! Qui potrai gestire gli utenti, i
            prodotti e le segnalazioni.
          </Alert>

          {/* Qui potrai inserire la logica e i componenti per:
            - Tabella Utenti (Moderazione/Ban)
            - Tabella Prodotti (Approvazione/Rimozione)
            - Grafici Statistiche
          */}

          <div className='mt-5 p-4 border rounded'>
            <p>Area riservata alle operazioni di moderazione.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;
