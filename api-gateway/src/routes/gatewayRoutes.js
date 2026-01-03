// src/routes/gatewayRoutes.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public USER service
router.use(
  '/users',
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
  })
);

// Helper function to attach headers to proxied requests
const addProxyHeaders = (proxyReq, req) => {
  proxyReq.setHeader('x-user-id', req.userId);
  proxyReq.setHeader('x-user-role', req.userRole);
  // proxyReq.setHeader('x-gateway-secret', req.gatewaySecret);
};

// BILLING service (protected)
router.use(
  '/billing',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
    onProxyReq: addProxyHeaders,
  })
);

// PAYMENT service (protected)
router.use(
  '/payments',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
    onProxyReq: addProxyHeaders,
  })
);

// PROVISIONING service (protected)
router.use(
  '/provisioning',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:5004',
    changeOrigin: true,
    onProxyReq: addProxyHeaders,
  })
);

module.exports = router;
