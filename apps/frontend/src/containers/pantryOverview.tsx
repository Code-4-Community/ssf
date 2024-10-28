import { useLoaderData } from 'react-router-dom';
import { Pantry } from '@api/models';
import React from 'react';

const PantryOverview: React.FC = () => {
  const pantryInfo = useLoaderData() as Pantry;

  return (
    <div>
      <p>Pantry overview</p>
      <p>Pantry name: {pantryInfo.name}</p>
      <p>Pantry address: {pantryInfo.address}</p>
      <p>Pantry approval status: {String(pantryInfo.approved)}</p>
    </div>
  );
};

export default PantryOverview;
