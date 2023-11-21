// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

global.React = React;

// Set environment variables
process.env.PASSPORT_CLIENT_ID='pN4HZXAD1NzlvZNgdRnUASeMrcdyzLTl';
process.env.PASSPORT_REDIRECT_URI='https://localhost:3000/redirect';
process.env.PASSPORT_LOGOUT_REDIRECT_URI='https://localhost:3000/logout';
process.env.PASSPORT_AUDIENCE='openid offline_access profile email transact';
process.env.PASSPORT_SCOPE='platform_api';
