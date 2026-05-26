import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>The page you're looking for doesn't exist or has been moved.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/shop" className="btn btn-secondary">Browse Shop</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
