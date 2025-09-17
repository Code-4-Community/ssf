import React from 'react';
import { Link } from 'react-router-dom';

const Homepage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>
        <strong>Site Navigation</strong>
      </h2>
      <section>
        <h3>
          <strong>Pantry View</strong>
        </h3>
        <ul>
          <li>
            <Link to="/pantry-overview">Pantry Overview</Link>
          </li>
          <li>
            <Link to="/pantry-dashboard/1">Pantry Dashboard (ID: 1)</Link>
          </li>
          <li>
            <Link to="/pantry-past-orders">Past Orders</Link>
          </li>
          <li>
            <Link to="/pantries">All Pantries</Link>
          </li>
          <li>
            <Link to="/request-form/1">Request Form (Pantry ID: 1)</Link>
          </li>
          <li>
            <Link to="/pantry-application">Pantry Application</Link>
          </li>
        </ul>
      </section>

      <section>
        <h3>
          <strong>Food Manufacturer View</strong>
        </h3>
        <ul>
          <li>
            <Link to="/food-manufacturer-order-dashboard">Order Dashboard</Link>
          </li>
          <li>
            <Link to="/orders">Orders</Link>
          </li>
        </ul>
      </section>

      <section>
        <h3>
          <strong>Admin View</strong>
        </h3>
        <ul>
          <li>
            <Link to="/approve-pantries">Approve Pantries</Link>
          </li>
          <li>
            <Link to="/donation-management">Donation Management</Link>
          </li>
        </ul>
      </section>

      <section>
        <h3>
          <strong>Other Pages</strong>
        </h3>
        <ul>
          <li>
            <Link to="/landing-page">Landing Page</Link>
          </li>
        </ul>
      </section>

      <div
        style={{
          marginTop: '40px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
        }}
      >
        <p>
          <strong>Note:</strong> This is a temporary navigation page for
          development purposes.
        </p>
        <p>Routes with parameters are using default values (e.g., ID: 1)</p>
      </div>
    </div>
  );
};

export default Homepage;
