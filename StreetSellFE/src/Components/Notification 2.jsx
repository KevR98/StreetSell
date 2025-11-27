import React, { useEffect, useState, useCallback } from 'react'; // Aggiungi React
import { NavDropdown, Badge, Spinner, Button, Dropdown } from 'react-bootstrap'; // Aggiungi Dropdown
import {
  FaTruck,
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

// ✅ TOGGLE CUSTOM PER MOBILE (Rimuove stili default link/padding)
const MobileNotificationToggle = React.forwardRef(
  ({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      {children}
    </div>
  )
);

function Notification({ isMobile = false }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  const getStorageKey = useCallback((userId) => {
    return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  }, []);

  const hideNotification = useCallback((id) => {
    setHiddenIds((prevIds) => new Set(prevIds).add(id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    const currentVisibleIds = notifications.map((n) => n.id);
    setHiddenIds((prevIds) => new Set([...prevIds, ...currentVisibleIds]));
  }, [notifications]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      try {
        const key = getStorageKey(currentUser.id);
        const storedData = localStorage.getItem(key);
        if (storedData) {
          setHiddenIds(new Set(JSON.parse(storedData)));
        } else {
          setHiddenIds(new Set());
        }
      } catch {
        setHiddenIds(new Set());
      } finally {
        setIsStorageLoaded(true);
      }
    } else {
      setHiddenIds(new Set());
      setIsStorageLoaded(false);
    }
  }, [currentUser, getStorageKey]);

  useEffect(() => {
    if (!currentUser || !isStorageLoaded) return;
    try {
      const idsArray = Array.from(hiddenIds);
      const key = getStorageKey(currentUser.id);
      localStorage.setItem(key, JSON.stringify(idsArray));
    } catch (e) {
      console.error('Errore localStorage:', e);
    }
  }, [hiddenIds, currentUser, getStorageKey, isStorageLoaded]);

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
      if (!resManagement.ok) throw new Error('Errore fetch');
      const ordiniGestione = await resManagement.json();

      if (Array.isArray(ordiniGestione)) {
        ordiniGestione.forEach((order) => {
          const isUserVendor = order.venditore?.id === currentUserId;
          const isUserBuyer = order.compratore?.id === currentUserId;
          const compratore = order.compratore?.username || 'Utente';
          const venditore = order.venditore?.username || 'Venditore';
          const prodotto = order.prodotto?.titolo || 'Prodotto';

          if (isUserVendor) {
            if (
              order.statoOrdine === 'CONFERMATO' ||
              order.statoOrdine === 'IN_ATTESA'
            ) {
              allNotifications.push({
                id: order.id,
                type: 'VENDITORE_ACQUISTO',
                message: `🎉 ${compratore} ha comprato: ${prodotto}.`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            } else if (order.statoOrdine === 'ANNULLATO') {
              allNotifications.push({
                id: order.id + '-annull',
                type: 'VENDITORE_ANNULLATO',
                message: `❌ ${compratore} ha annullato per ${prodotto}.`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            } else if (order.statoOrdine === 'COMPLETATO') {
              allNotifications.push({
                id: order.id + '-vend-comp',
                type: 'VENDITORE_COMPLETATO',
                message: `🎉 Ordine completato per ${prodotto}!`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            }
          }

          if (isUserBuyer && order.statoOrdine === 'SPEDITO') {
            allNotifications.push({
              id: order.id + '-comp',
              type: 'COMPRATORE_SPEDITO',
              message: `🚚 ${venditore} ha spedito ${prodotto}.`,
              date: new Date(order.dataOrdine),
              prodottoId: order.prodotto?.id,
            });
          }
        });
      }
      allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
      setNotifications(allNotifications);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (!token || !currentUser) return;
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [token, currentUser, fetchNotifications]);

  if (!currentUser || !token) return null;

  const visibleNotifications = notifications.filter(
    (n) => !hiddenIds.has(n.id)
  );
  const totalCount = visibleNotifications.length;

  // ✅ TITOLO (Icona + Badge)
  // Se è mobile, rimuovo il margine a destra dell'icona (me-2) per centrarla
  const titleContent = (
    <div className='d-flex align-items-center position-relative'>
      <FaBell size={20} className={isMobile ? '' : 'me-2'} />
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

  // ✅ CONTENUTO DEL MENU (Estratto per riusarlo)
  const renderDropdownItems = () => (
    <>
      {isLoading && <Dropdown.ItemText>Caricamento...</Dropdown.ItemText>}
      {!isLoading && visibleNotifications.length === 0 && (
        <Dropdown.ItemText>Nessuna notifica.</Dropdown.ItemText>
      )}

      {visibleNotifications.slice(0, 5).map((notif) => (
        <Dropdown.Item
          key={notif.id}
          as={notif.type.endsWith('_ANNULLATO') ? 'div' : Link}
          to={
            notif.type.endsWith('_ANNULLATO')
              ? '#'
              : notif.type.startsWith('VENDITORE')
              ? '/ordini/gestione'
              : `/prodotto/${notif.prodottoId}`
          }
          className='small position-relative d-flex align-items-center'
          style={{ whiteSpace: 'normal', minWidth: '280px' }} // Fix per testo lungo
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
            className='p-0 ms-auto text-muted'
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              hideNotification(notif.id);
            }}
          >
            &times;
          </Button>
        </Dropdown.Item>
      ))}

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
          <Link to='/ordini/gestione' className='btn btn-link btn-sm'>
            Gestione
          </Link>
        </Dropdown.ItemText>
      )}
    </>
  );

  // 📱 RENDER MOBILE: Usa Dropdown "pulito" (niente stili NavLink)
  if (isMobile) {
    return (
      <Dropdown drop='up' align='end'>
        <Dropdown.Toggle as={MobileNotificationToggle}>
          {titleContent}
        </Dropdown.Toggle>
        <Dropdown.Menu className='shadow border-0'>
          {renderDropdownItems()}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  // 💻 RENDER DESKTOP: Usa NavDropdown standard (con margini e caret)
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
