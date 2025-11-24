import { useEffect, useState, useCallback } from 'react';
import { NavDropdown, Badge, Spinner, Button } from 'react-bootstrap';
import {
  FaTruck,
  FaBoxOpen,
  FaShoppingCart,
  FaBell,
  FaTimesCircle,
  FaCheckCircle,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const MANAGEMENT_ENDPOINT = 'http://localhost:8888/ordini/gestione';
const STORAGE_KEY = 'hidden_notification_ids';
const POLLING_INTERVAL = 30000;

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. STATO: Inizializza vuoto
  const [hiddenIds, setHiddenIds] = useState(new Set());

  // 🛑 NUOVO FLAG: Impedisce il salvataggio finché non abbiamo caricato i dati
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  // Funzione helper per ottenere la chiave specifica per l'utente
  const getStorageKey = useCallback((userId) => {
    return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  }, []);

  // 2. HIDE NOTIFICATION
  const hideNotification = useCallback((id) => {
    setHiddenIds((prevIds) => new Set(prevIds).add(id));
  }, []);

  // 3. CLEAR ALL NOTIFICATIONS
  const clearAllNotifications = useCallback(() => {
    const currentVisibleIds = notifications.map((n) => n.id);
    setHiddenIds((prevIds) => new Set([...prevIds, ...currentVisibleIds]));
  }, [notifications]);

  // 🛑 4. CARICAMENTO (LOAD): Esegue solo all'avvio o cambio utente
  useEffect(() => {
    if (currentUser && currentUser.id) {
      try {
        const key = getStorageKey(currentUser.id);
        const storedData = localStorage.getItem(key);

        if (storedData) {
          // Se troviamo dati, li impostiamo
          setHiddenIds(new Set(JSON.parse(storedData)));
        } else {
          // Se non ci sono dati, resettiamo
          setHiddenIds(new Set());
        }
      } catch (e) {
        console.error('Errore nel caricamento della chiave utente:', e);
        setHiddenIds(new Set());
      } finally {
        // 🛑 FONDAMENTALE: Diciamo all'app che abbiamo finito di caricare
        setIsStorageLoaded(true);
      }
    } else {
      // Logout
      setHiddenIds(new Set());
      setIsStorageLoaded(false);
    }
  }, [currentUser, getStorageKey]);

  // 🛑 5. SALVATAGGIO (SAVE): Protetto dal flag isStorageLoaded
  useEffect(() => {
    // 🛑 SE NON ABBIAMO ANCORA CARICATO, NON SALVARE NULLA!
    // Questo previene la sovrascrittura con array vuoto al refresh
    if (!currentUser || !isStorageLoaded) return;

    try {
      const idsArray = Array.from(hiddenIds);
      const key = getStorageKey(currentUser.id);
      localStorage.setItem(key, JSON.stringify(idsArray));
    } catch (e) {
      console.error('Errore nel salvataggio in localStorage:', e);
    }
  }, [hiddenIds, currentUser, getStorageKey, isStorageLoaded]); // Dipende anche da isStorageLoaded

  // 6. FETCH NOTIFICA
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    let allNotifications = [];

    const headers = { Authorization: `Bearer ${token}` };
    const currentUserId = currentUser?.id;

    if (!token || !currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      const resManagement = await fetch(MANAGEMENT_ENDPOINT, { headers });

      if (!resManagement.ok) {
        throw new Error('Errore nel caricamento delle task unificate.');
      }

      const ordiniGestione = await resManagement.json();

      if (Array.isArray(ordiniGestione)) {
        ordiniGestione.forEach((order) => {
          const isUserVendor = order.venditore?.id === currentUserId;
          const isUserBuyer = order.compratore?.id === currentUserId;

          const compratoreUsername = order.compratore?.username || 'Un utente';
          const venditoreUsername = order.venditore?.username || 'Il venditore';
          const prodottoTitolo = order.prodotto?.titolo || 'Prodotto N/D';

          if (isUserVendor) {
            if (
              order.statoOrdine === 'CONFERMATO' ||
              order.statoOrdine === 'IN_ATTESA'
            ) {
              allNotifications.push({
                id: order.id,
                type: 'VENDITORE_ACQUISTO',
                message: `🎉 ${compratoreUsername} ha comprato: ${prodottoTitolo}. Spedisci subito!`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            } else if (order.statoOrdine === 'ANNULLATO') {
              allNotifications.push({
                id: order.id + '-annull',
                type: 'VENDITORE_ANNULLATO',
                message: `❌ Attenzione! ${compratoreUsername} ha annullato l'ordine per ${prodottoTitolo}.`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            } else if (order.statoOrdine === 'COMPLETATO') {
              allNotifications.push({
                id: order.id + '-vend-comp',
                type: 'VENDITORE_COMPLETATO',
                message: `🎉 ${compratoreUsername} ha confermato la ricezione di ${prodottoTitolo}. Ordine Completato!`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            }
          }

          if (isUserBuyer) {
            if (order.statoOrdine === 'SPEDITO') {
              allNotifications.push({
                id: order.id + '-comp',
                type: 'COMPRATORE_SPEDITO',
                message: `🚚 Ottime notizie! ${venditoreUsername} ha spedito il tuo ordine: ${prodottoTitolo}.`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            }
          }
        });
      }

      allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Errore fetch notifiche:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser]);

  // 7. POLLING
  useEffect(() => {
    if (!token || !currentUser) {
      setNotifications([]);
      setHiddenIds(new Set());
      setIsStorageLoaded(false); // Reset flag
      localStorage.removeItem(getStorageKey(currentUser?.id));
      setIsLoading(false);
      return;
    }

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUser, fetchNotifications]);

  if (!currentUser || !token) return null;

  // FILTRAGGIO VISIVO
  const visibleNotifications = notifications.filter(
    (n) => !hiddenIds.has(n.id)
  );
  const totalCount = visibleNotifications.length;

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

      {!isLoading && visibleNotifications.length === 0 && (
        <NavDropdown.ItemText>Nessuna notifica in attesa.</NavDropdown.ItemText>
      )}

      {visibleNotifications.slice(0, 5).map((notif) => (
        <NavDropdown.Item
          key={notif.id}
          as={notif.type.endsWith('_ANNULLATO') ? 'div' : Link}
          to={
            notif.type.endsWith('_ANNULLATO')
              ? '#'
              : notif.type.startsWith('VENDITORE')
              ? '/ordini/gestione'
              : `/prodotto/${notif.prodottoId}`
          }
          className='small position-relative d-flex align-items-center dropdown-item-custom'
          onClick={
            notif.type.endsWith('_ANNULLATO')
              ? (e) => e.preventDefault()
              : undefined
          }
        >
          <span className='flex-grow-1'>
            {notif.type === 'VENDITORE_ACQUISTO' ? (
              <FaShoppingCart className='text-success me-2' />
            ) : notif.type === 'COMPRATORE_SPEDITO' ? (
              <FaTruck className='text-primary me-2' />
            ) : notif.type === 'VENDITORE_ANNULLATO' ? (
              <FaTimesCircle className='text-danger me-2' />
            ) : (
              <FaCheckCircle className='text-info me-2' />
            )}
            {notif.message}
            <span
              className='d-block text-muted'
              style={{ fontSize: '0.75rem' }}
            >
              {notif.date.toLocaleTimeString()}
            </span>
          </span>

          <Button
            variant='link'
            size='sm'
            className='p-0 ms-auto text-muted btn-close-notif'
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              hideNotification(notif.id);
            }}
            style={{
              visibility: 'hidden',
            }}
          >
            &times;
          </Button>
        </NavDropdown.Item>
      ))}

      {visibleNotifications.length > 0 && <NavDropdown.Divider />}

      {visibleNotifications.length > 0 && (
        <NavDropdown.ItemText className='text-center d-flex justify-content-between align-items-center p-2'>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={clearAllNotifications}
          >
            ❌ Cancella Tutte ({totalCount})
          </Button>
          <Link to='/ordini/gestione' className='btn btn-link btn-sm'>
            Vedi Gestione
          </Link>
        </NavDropdown.ItemText>
      )}
    </NavDropdown>
  );
}

export default Notification;
