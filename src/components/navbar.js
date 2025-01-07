import React from 'react';

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>My AI</div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#eee',
    marginBottom: '1rem',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
};

export default Navbar;
