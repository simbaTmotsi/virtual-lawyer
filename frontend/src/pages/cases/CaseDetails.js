import React from 'react';
import { useParams } from 'react-router-dom';

const CaseDetails = () => {
  const { id } = useParams();
  return (
    <div>
      <h2>Case Details</h2>
      <p>Details for case ID: {id}</p>
      {/* Placeholder for case details */}
    </div>
  );
};

export default CaseDetails;
