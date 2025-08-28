
import dotenv from 'dotenv/config.js';
import http from 'http';
import express from 'express';
import app from './app.js';
const server = http.createServer(app);
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});