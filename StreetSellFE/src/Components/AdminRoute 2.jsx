import { Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// eslint-disable-next-line no-unused-vars
const AdminRoute = ({ AdminComp, ...rest }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const ruolo = useSelector((state) => state.auth.user?.ruolo);
  const isLoading = useSelector((state) => state.auth.isLoading);

  if (isLoading) {
    return (
      <div className='d-flex justify-content-center mt-5'>
        <Spinner animation='border' />
        <p>Verifica delle credenziali...</p>
      </div>
    );
  }

  const isAdmin = ruolo === 'ADMIN';

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to='/' replace />;
  }

  return <AdminComp {...rest} />;
};

export default AdminRoute;
