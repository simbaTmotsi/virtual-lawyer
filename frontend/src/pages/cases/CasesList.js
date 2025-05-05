import React from 'react';
import { Link } from 'react-router-dom';

const CasesList = () => {
  return (
    <div>
      <h2>Cases List</h2>
      <Link to="/cases/new">Add New Case</Link>
      {/* Placeholder for case list table */}
    </div>
  );
};

export default CasesList;
