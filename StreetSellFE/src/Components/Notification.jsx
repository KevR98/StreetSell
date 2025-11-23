import { useEffect, useState } from 'react';
import { NavDropdown, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaBoxOpen, FaTruck, FaShoppingCart, FaBell } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const MANAGEMENT_ENDPOINT = 'http://localhost:8888/ordini/gestione';
const POLLING_INTERVAL = 30000;

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  const fetchNotifications = async () => {
    setIsLoading(true);
    let allNotifications = [];

    const headers = { Authorization: `Bearer ${token}` };
    const currentUserId = currentUser?.id; // Ottieni l'ID dell'utente loggato

    try {
      // 1. Fetch della LISTA UNIFICATA (Ordini CONFERMATO + SPEDITO)
      const resManagement = await fetch(MANAGEMENT_ENDPOINT, { headers });

      if (!resManagement.ok) {
        // Se il BE risponde 404/500, lanciamo un errore
        throw new Error('Errore nel caricamento delle task unificate.');
      }

      // 🛑 ordiniGestione è ora la LISTA, pronta per forEach()
      const ordiniGestione = await resManagement.json();

      // 🛑 Assicurati che sia un array prima di iterare (prevenzione)
      if (Array.isArray(ordiniGestione)) {
        ordiniGestione.forEach((order) => {
          const isUserVendor = order.venditore?.id === currentUserId;
          const isUserBuyer = order.compratore?.id === currentUserId;

          // Logica della Notifica (Creiamo la notifica solo per la task attiva)
          if (isUserVendor && order.statoOrdine === 'CONFERMATO') {
            // Task Venditore: Spedisci
            allNotifications.push({
              id: order.id,
              type: 'VENDITORE',
              message: `Qualcuno ha comprato: ${
                order.prodotto?.titolo || 'Prodotto N/D'
              }`,
              date: new Date(order.dataOrdine),
              prodottoId: order.prodotto?.id,
            });
          } else if (isUserBuyer && order.statoOrdine === 'SPEDITO') {
            // Task Compratore: Conferma Arrivo
            allNotifications.push({
              id: order.id + '-comp',
              type: 'COMPRATORE',
              message: `Il tuo ordine di ${
                order.prodotto?.titolo || 'Prodotto N/D'
              } è stato spedito!`,
              date: new Date(order.dataOrdine),
              prodottoId: order.prodotto?.id,
            });
          } else if (isUserVendor && order.statoOrdine === 'COMPLETATO') {
            allNotifications.push({
              id: order.id + '-vend-comp', // ID univoco per questa notifica
              type: 'VENDITORE_COMPLETATO',
              message: `🎉 Il tuo ordine: ${
                order.prodotto?.titolo || 'Prodotto N/D'
              } è stato COMPLETATO dal compratore.`,
              date: new Date(order.dataOrdine),
              prodottoId: order.prodotto?.id,
            });
          }
        });
      }

      // 2. Ordina e imposta il conteggio totale dalla lista
      allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());

      setTotalCount(allNotifications.length); // 🛑 Conteggio totale corretto
      setNotifications(allNotifications.slice(0, 5));
    } catch (error) {
      console.error('Errore fetch notifiche:', error);
      setNotifications([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Esci subito se non c'è token, ma l'hook è stato chiamato incondizionatamente
    if (!token) return;

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!currentUser || !token) return null;

  const titleContent = (
    <div className='d-flex align-items-center position-relative'>
      <FaBell size={20} className='me-2' />
      {totalCount > 0 && (
        <Badge
          bg='danger'
          pill
          className='position-absolute top-0 start-100 translate-middle ms-1'
        >
          {isLoading ? (
            <Spinner animation='border' size='sm' className='p-0 m-0' />
          ) : (
            totalCount
          )}
        </Badge>
      )}
    </div>
  );

  return (
    <NavDropdown
      title={titleContent}
      id='notifications-dropdown'
      align='end'
      className='me-3 no-caret'
    >
      {isLoading && <NavDropdown.ItemText>Caricamento...</NavDropdown.ItemText>}

      {!isLoading && totalCount === 0 && (
        <NavDropdown.ItemText>Nessuna notifica in attesa.</NavDropdown.ItemText>
      )}

      {/* Mappa gli ordini recenti nella tendina */}
      {notifications.map((notif) => (
        <NavDropdown.Item
          key={notif.id}
          as={Link}
          // VENDITORE va alla pagina di gestione, COMPRATORE va ai dettagli prodotto
          to={
            notif.type === 'VENDITORE'
              ? '/ordini/gestione'
              : `/prodotto/${notif.prodottoId}`
          }
          className='small'
        >
          {notif.type === 'VENDITORE' ? (
            <FaShoppingCart className='text-success me-2' /> // Task da Spedire
          ) : notif.type === 'COMPRATORE' ? (
            <FaTruck className='text-primary me-2' /> // Task da Confermare
          ) : (
            // 🛑 Icona per la notifica COMPLETATO
            <span className='me-2' style={{ fontSize: '1.2rem' }}>
              🎉
            </span>
          )}
          {notif.message}
          <span className='d-block text-muted' style={{ fontSize: '0.75rem' }}>
            {notif.date.toLocaleTimeString()}
          </span>
        </NavDropdown.Item>
      ))}

      {totalCount > 0 && <NavDropdown.Divider />}

      {/* Link che porta alla lista completa degli ordini da gestire */}
      {totalCount > 0 && (
        <NavDropdown.Item
          as={Link}
          to='/ordini/gestione'
          className='text-primary text-center'
        >
          Vedi tutti gli ordini da gestire ({totalCount})
        </NavDropdown.Item>
      )}
    </NavDropdown>
  );
}

export default Notification;
