import React, { useEffect, useState, useCallback } from 'react';
import { NavDropdown, Badge, Spinner, Button, Dropdown } from 'react-bootstrap';
import { FaTruck, FaShoppingCart, FaBell, FaCheckCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const managementEndpoint = 'http://localhost:8888/ordini/gestione';
const storageKey = 'hiddenNotificationIds';
const pollingInterval = 30000;

// Componente Custom Toggle per il menu a discesa mobile
const MobileNotificationToggle = React.forwardRef(
  ({ onClick, icon, count }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
        color: 'white',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Icona della campana o icona custom */}
        {icon || <FaBell size={20} />}
        {/* Badge per il contatore delle notifiche visibili */}
        {count > 0 && (
          <Badge
            pill
            bg='danger'
            className='position-absolute top-0 start-100 translate-middle'
            style={{
              fontSize: '0.65rem',
              padding: '0.15em 0.4em',
              lineHeight: '1',
              zIndex: 10,
            }}
          >
            {count > 9 ? '9+' : count}
          </Badge>
        )}
      </div>
    </div>
  )
);

function Notification({ isMobile = false, icon }) {
  const navigate = useNavigate();
  // Stato per le notifiche (derivate dagli ordini)
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Set degli ID delle notifiche che l'utente ha scelto di nascondere
  const [hiddenIds, setHiddenIds] = useState(new Set());
  // Flag per indicare che gli ID nascosti sono stati caricati da localStorage
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  /**
   * Genera la chiave di localStorage basata sull'ID utente per isolare i dati.
   */
  const getStorageKey = useCallback((userId) => {
    return userId ? `${storageKey}-${userId}` : storageKey;
  }, []);

  /**
   * Carica gli ID delle notifiche nascoste da localStorage.
   */
  const loadHiddenIds = useCallback(
    (userId) => {
      const key = getStorageKey(userId);
      const storedIds = localStorage.getItem(key);
      if (storedIds) {
        setHiddenIds(new Set(JSON.parse(storedIds)));
      }
      // Una volta terminato il caricamento (anche se vuoto), imposto il flag
      setIsStorageLoaded(true);
    },
    [getStorageKey]
  );

  /**
   * Salva gli ID delle notifiche nascoste in localStorage.
   */
  const saveHiddenIds = useCallback(
    (ids, userId) => {
      const key = getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(Array.from(ids)));
    },
    [getStorageKey]
  );

  /**
   * Funzione per il fetch degli ordini da cui vengono generate le notifiche.
   */
  const fetchNotifications = useCallback(async () => {
    // Non procedo se mancano token, utente o se lo storage non è stato ancora caricato
    if (!token || !currentUser || !isStorageLoaded) return;

    try {
      const res = await fetch(managementEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Errore nel caricamento delle notifiche');
      }

      const data = await res.json();
      const allOrders = Array.isArray(data) ? data : [];

      // Filtro gli ordini per creare notifiche solo per gli stati attivi
      const newNotifications = allOrders
        .filter(
          (order) =>
            order.statoOrdine !== 'COMPLETATO' &&
            order.statoOrdine !== 'ANNULLATO'
        )
        .map((order) => ({
          id: order.id, // L'ID dell'ordine funge da ID notifica
          type: order.statoOrdine,
          prodotto: order.prodotto.titolo,
          orderId: order.id,
          data: new Date(order.dataOrdine),
        }));

      // Ordino per data decrescente
      newNotifications.sort((a, b) => b.data - a.data);

      setNotifications(newNotifications);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser, isStorageLoaded]);

  // EFFETTO 1: Caricamento degli ID nascosti all'avvio
  useEffect(() => {
    if (currentUser) {
      loadHiddenIds(currentUser.id);
    } else {
      // Se non c'è utente, considero lo storage caricato per non bloccare l'effetto successivo
      setIsStorageLoaded(true);
    }
  }, [currentUser, loadHiddenIds]);

  // EFFETTO 2: Polling delle notifiche
  useEffect(() => {
    if (isStorageLoaded && currentUser && token) {
      fetchNotifications();
      // Imposto il polling interval
      const interval = setInterval(fetchNotifications, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [token, currentUser, isStorageLoaded, fetchNotifications]);

  /**
   * Aggiunge l'ID della notifica al set degli ID nascosti.
   */
  const hideNotification = (id) => {
    const newHiddenIds = new Set(hiddenIds);
    newHiddenIds.add(id);
    setHiddenIds(newHiddenIds);
    saveHiddenIds(newHiddenIds, currentUser.id);
  };

  /**
   * Nasconde tutte le notifiche attualmente visibili.
   */
  const clearAllNotifications = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setHiddenIds(allIds);
    saveHiddenIds(allIds, currentUser.id);
  };

  /**
   * Restituisce i dettagli di rendering per una singola notifica (icona, messaggio, tempo).
   */
  const getNotificationDetails = (notif) => {
    let iconRender, message, variant;

    // Logica per l'icona e il messaggio basata sullo stato dell'ordine
    switch (notif.type) {
      case 'IN_PREPARAZIONE':
        iconRender = <FaShoppingCart className='text-info me-2' />;
        message = `Ordine #${notif.orderId} (Prodotto: ${notif.prodotto}) è in preparazione.`;
        variant = 'info';
        break;
      case 'IN_SPEDIZIONE':
        iconRender = <FaTruck className='text-primary me-2' />;
        message = `Ordine #${notif.orderId} (Prodotto: ${notif.prodotto}) è in spedizione.`;
        variant = 'primary';
        break;
      case 'CONSEGNATO':
        iconRender = <FaCheckCircle className='text-success me-2' />;
        message = `Ordine #${notif.orderId} (Prodotto: ${notif.prodotto}) è stato consegnato!`;
        variant = 'success';
        break;
      default:
        iconRender = <FaBell className='text-secondary me-2' />;
        message = `Nuova notifica: ${notif.prodotto}.`;
        variant = 'secondary';
    }

    // Calcolo del tempo trascorso ('Xm fa', 'Yh fa', ecc.)
    const timeAgo = Math.floor((new Date() - notif.data) / (1000 * 60));
    let timeText;
    if (timeAgo < 1) {
      timeText = 'Ora';
    } else if (timeAgo < 60) {
      timeText = `${timeAgo}m fa`;
    } else if (timeAgo < 1440) {
      timeText = `${Math.floor(timeAgo / 60)}h fa`;
    } else {
      timeText = `${Math.floor(timeAgo / 1440)}g fa`;
    }

    return { iconRender, message, timeText, variant };
  };

  // Notifiche da visualizzare (filtra quelle nascoste)
  const visibleNotifications = notifications.filter(
    (notif) => !hiddenIds.has(notif.id)
  );

  // Contenuto del titolo per la NavDropdown Desktop
  const titleContent = (
    <div className='d-flex align-items-center'>
      <FaBell size={20} className='me-2' />
      Notifiche
      {visibleNotifications.length > 0 && (
        <Badge pill bg='danger' className='ms-2'>
          {visibleNotifications.length > 9 ? '9+' : visibleNotifications.length}
        </Badge>
      )}
    </div>
  );

  /**
   * Renderizza gli elementi interni del Dropdown (item, spinner, ecc.).
   */
  const renderDropdownItems = () => (
    <>
      {isLoading ? (
        <Dropdown.ItemText className='text-center'>
          <Spinner animation='border' size='sm' /> Caricamento...
        </Dropdown.ItemText>
      ) : visibleNotifications.length === 0 ? (
        <Dropdown.ItemText className='text-center text-muted'>
          Nessuna notifica.
        </Dropdown.ItemText>
      ) : (
        // Mappa le prime 5 notifiche visibili
        visibleNotifications.slice(0, 5).map((notif) => {
          const { iconRender, message, timeText } =
            getNotificationDetails(notif);
          return (
            <Dropdown.Item
              key={notif.id}
              className='d-flex justify-content-between align-items-start dropdown-item-custom'
              as='div'
              style={{ cursor: 'pointer' }}
              // Naviga alla pagina di gestione ordini
              onClick={() => navigate(`/ordini/gestione`)}
            >
              <div className='d-flex flex-column me-2'>
                <div className='small fw-bold text-wrap'>
                  {iconRender}
                  {message}
                </div>
                <div className='text-muted' style={{ fontSize: '0.75rem' }}>
                  {timeText}
                </div>
              </div>
              {/* Bottone per nascondere la singola notifica */}
              <Button
                variant='link'
                size='sm'
                className='ms-auto text-muted p-0'
                onClick={(e) => {
                  // Blocca la propagazione per non attivare il click sull'item
                  e.stopPropagation();
                  e.preventDefault();
                  hideNotification(notif.id);
                }}
              >
                &times;
              </Button>
            </Dropdown.Item>
          );
        })
      )}

      {/* Separatore e link di gestione */}
      {visibleNotifications.length > 0 && <Dropdown.Divider />}

      {visibleNotifications.length > 0 && (
        <Dropdown.ItemText className='text-center d-flex justify-content-between align-items-center p-2'>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={clearAllNotifications}
          >
            Cancella
          </Button>
          {/* Link alla pagina di gestione ordini */}
          <Link to='/ordini/gestione' className='btn btn-link btn-sm'>
            Gestione
          </Link>
        </Dropdown.ItemText>
      )}
    </>
  );

  // RENDER MOBILE (Dropup)
  if (isMobile) {
    return (
      <Dropdown drop='up' align='end'>
        <Dropdown.Toggle
          as={MobileNotificationToggle}
          icon={icon}
          count={visibleNotifications.length}
          id='dropdown-mobile-notifications'
        />
        <Dropdown.Menu className='shadow border-0'>
          {renderDropdownItems()}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  // RENDER DESKTOP (NavDropdown)
  return (
    <NavDropdown
      title={titleContent}
      id='notifications-dropdown'
      align='end'
      className='me-3 no-caret'
    >
      {renderDropdownItems()}
    </NavDropdown>
  );
}

export default Notification;
