import { Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * Questo è un componente che funge da "guardia" per le rotte.
 * Controlla se l'utente che sta cercando di accedere ha i permessi di Amministratore.
 * Se non è un Admin, lo blocca e lo reindirizza.
 */
// eslint-disable-next-line no-unused-vars
const AdminRoute = ({ AdminComp, ...rest }) => {
  // Recupero dallo stato di Redux le informazioni essenziali per il controllo:
  // se l'utente è loggato, quale ruolo ha e se il sistema è ancora in attesa
  // di caricare i dati di autenticazione.
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const ruolo = useSelector((state) => state.auth.user?.ruolo);
  const isLoading = useSelector((state) => state.auth.isLoading);

  // Prima cosa: se sto ancora caricando i dati (ad esempio, sto verificando il token
  // dopo un refresh della pagina), mostro uno spinner per non mostrare contenuto sbagliato.
  if (isLoading) {
    return (
      <div className='d-flex justify-content-center mt-5'>
        <Spinner animation='border' />
        <p>Verifica delle credenziali...</p>
      </div>
    );
  }

  // Definisco una semplice variabile booleana per vedere se il ruolo è "ADMIN".
  const isAdmin = ruolo === 'ADMIN';

  // Se l'utente NON è autenticato OPPURE NON è un amministratore (isAdmin è falso),
  // utilizzo il componente <Navigate /> per reindirizzarlo immediatamente alla homepage ('/').
  // L'opzione 'replace' impedisce all'utente di usare il tasto "indietro" del browser per tornare qui.
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to='/' replace />;
  }

  // Se i controlli hanno successo, significa che l'utente è autorizzato.
  // A questo punto, renderizzo il componente che l'Admin intendeva raggiungere (AdminComp),
  // passandogli tutte le proprietà aggiuntive che sono state fornite (tramite ...rest).
  return <AdminComp {...rest} />;
};

export default AdminRoute;
