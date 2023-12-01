import React from 'react';
import { NavLink } from 'react-router-dom';
import './Styles/Navigator.css';

const Navigator = () => {
  return (
    <nav className="navbar">
      <ul>
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/chat">Chat</NavLink></li>
        <li><NavLink to="/knowledge">Knowledge</NavLink></li>
        <li><NavLink to="/files">Files</NavLink></li>
        <li><NavLink to="/process">Processes</NavLink></li>
        <li><NavLink to="/tools">Tools</NavLink></li>
        <li><NavLink to="/settings">Settings</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/contact">Contact Us</NavLink></li>
      </ul>
    </nav>
  );
};

export default Navigator;