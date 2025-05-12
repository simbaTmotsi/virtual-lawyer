import React, { useState } from 'react';
import { register } from '../services/auth'; // Updated import path

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      email: email,
      password: password,
      password2: confirmPassword,
      first_name: firstName,
      last_name: lastName,
      role: role,
    };
    
    try {
      await register(userData);
    } catch (error) {
      if (error.detail) {
        setError(Array.isArray(error.detail) 
          ? error.detail.map(err => err.msg).join(', ') 
          : error.detail);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      {error && <p>{error}</p>}
      <button type="submit">Register</button>
    </form>
  );
};

export default RegistrationForm;