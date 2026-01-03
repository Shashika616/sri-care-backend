const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * USER SERVICE
 * Public routes: register, login, password reset
 */
router.use(
  '/users',
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
  })
);

/**
 * BILLING SERVICE (Protected)
 */
router.use(
  '/billing',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
  })
);

/**
 * PAYMENT SERVICE (Protected)
 */
router.use(
  '/payments',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
  })
);

/**
 * PROVISIONING SERVICE (Protected)
 */
router.use(
  '/provisioning',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:5004',
    changeOrigin: true,
  })
);

module.exports = router;
