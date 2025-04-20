// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role');

  if (!role || !allowedRoles.includes(role)) {
    // Redirect to the appropriate page based on the user's role
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
