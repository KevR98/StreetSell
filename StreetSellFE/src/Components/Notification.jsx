import { useEffect, useState } from 'react';
import { NavDropdown, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaBoxOpen, FaTruck, FaShoppingCart, FaBell } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const VENDITORE_ENDPOINT = 'http://localhost:8888/ordini/venditore'; // Endpoint lista venditore
const COMPRATORE_ENDPOINT = 'http://localhost:8888/ordini/compratore/notifiche'; // Nuovo endpoint acquirente
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

    try {
      // 1. Fetch Notifiche Venditore (Ordini CONFERMATI = da spedire)
      const resVenditore = await fetch(VENDITORE_ENDPOINT, { headers });
      if (resVenditore.ok) {
        const ordiniVenditore = await resVenditore.json();
        ordiniVenditore.forEach((order) => {
          allNotifications.push({
            id: order.id,
            type: 'VENDITORE',
            message: `Qualcuno ha comprato: ${
              order.prodotto?.titolo || 'Prodotto N/D'
            }`,
            date: new Date(order.dataOrdine),
            prodottoId: order.prodotto?.id,
          });
        });
      }

      // 2. Fetch Notifiche Compratore (Ordini SPEDITI = in arrivo)
      const resCompratore = await fetch(COMPRATORE_ENDPOINT, { headers });
      if (resCompratore.ok) {
        const ordiniCompratore = await resCompratore.json();
        ordiniCompratore.forEach((order) => {
          allNotifications.push({
            id: order.id + '-comp', // Chiave univoca
            type: 'COMPRATORE',
            message: `Il tuo ordine di ${
              order.prodotto?.titolo || 'Prodotto N/D'
            } è stato spedito!`,
            date: new Date(order.dataOrdine),
            prodottoId: order.prodotto?.id,
          });
        });
      }

      // 3. Ordina le notifiche per data (più recenti per prime)
      allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());

      setNotifications(allNotifications.slice(0, 5)); // Mostra solo le ultime 5
      setTotalCount(allNotifications.length);
    } catch (error) {
      console.error('Errore fetch notifiche:', error);
      setNotifications([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
              ? '/ordini/venditore'
              : `/prodotto/${notif.prodottoId}`
          }
          className='small'
        >
          {notif.type === 'VENDITORE' ? (
            <FaShoppingCart className='text-success me-2' />
          ) : (
            <FaTruck className='text-primary me-2' />
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
          to='/ordini/venditore'
          className='text-primary text-center'
        >
          Vedi tutti gli ordini da gestire ({totalCount})
        </NavDropdown.Item>
      )}
    </NavDropdown>
  );
}

export default Notification;
