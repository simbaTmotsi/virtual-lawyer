import React from 'react';
import { Link } from 'react-router-dom';

const ClientsList = () => {
  return (
    <div>
      <h2>Clients List</h2>
      <Link to="/clients/new">Add New Client</Link>
      {/* Placeholder for client list table */}
    </div>
  );
};

export default ClientsList;
