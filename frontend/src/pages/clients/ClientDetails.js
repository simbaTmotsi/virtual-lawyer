import React from 'react';
import { useParams } from 'react-router-dom';

const ClientDetails = () => {
  const { id } = useParams();
  return (
    <div>
      <h2>Client Details</h2>
      <p>Details for client ID: {id}</p>
      {/* Placeholder for client details */}
    </div>
  );
};

export default ClientDetails;
