const { createProxyMiddleware } = require('http-proxy-middleware');

// const buildProxy = (target, pathPrefix, enablews) =>
//   createProxyMiddleware({
//     target,
//     changeOrigin: true,
//     ws: enablews,
//     headers: {
//       'X-Gateway-Secret': process.env.GATEWAY_SECRET
//     },
//     pathRewrite: (path) => {
//       // For all services, add their API prefix
//       // path comes without the route prefix (e.g., /login, /billing, /pay)
//       return pathPrefix + path;
//     },
//     onProxyReq: (proxyReq, req) => {
//       console.log(`[GATEWAY] ${req.method} ${req.originalUrl} → ${target}${proxyReq.path}`);
      
//       // Forward user info from auth middleware
//       if (req.userId) proxyReq.setHeader('X-User-Id', req.userId);
//       if (req.userRole) proxyReq.setHeader('X-User-Role', req.userRole);
      
//       // Forward original Authorization header if present
//       if (req.headers.authorization) {
//         proxyReq.setHeader('authorization', req.headers.authorization);
//       }

//             // Log what we're sending
//       console.log('[GATEWAY] Headers sent:', {
//         hasGatewaySecret: true,
//         hasUserId: !!req.userId,
//         hasAuth: !!req.headers.authorization
//       });

//     },
//     onProxyRes: (proxyRes) => {
//       console.log('[GATEWAY] Response:', proxyRes.statusCode);
//     },
//     onError: (err, req, res) => {
//       console.error('[GATEWAY ERROR]', err.message);
//       res.status(502).json({ message: 'Service unavailable', service: target });
//     },
//   });

const buildProxy = (target, pathPrefix, enablews) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: enablews,
    headers: {
      'X-Gateway-Secret': process.env.GATEWAY_SECRET
    },
    pathRewrite: (path) => pathPrefix + path,
    onProxyReq: (proxyReq, req) => {
      // normal HTTP requests
      if (req.userId) proxyReq.setHeader('X-User-Id', req.userId);
      if (req.userRole) proxyReq.setHeader('X-User-Role', req.userRole);
      if (req.headers.authorization) proxyReq.setHeader('authorization', req.headers.authorization);
      proxyReq.setHeader('X-Gateway-Secret', process.env.GATEWAY_SECRET);
    },
    onProxyReqWs: (proxyReq, req, socket, options, head) => {
      // WebSocket upgrade request
      if (req.userId) proxyReq.setHeader('X-User-Id', req.userId);
      if (req.userRole) proxyReq.setHeader('X-User-Role', req.userRole);
      if (req.headers.authorization) proxyReq.setHeader('authorization', req.headers.authorization);
      proxyReq.setHeader('X-Gateway-Secret', process.env.GATEWAY_SECRET);
      console.log('[GATEWAY WS] Headers sent:', {
        hasGatewaySecret: true,
        hasUserId: !!req.userId,
        hasAuth: !!req.headers.authorization
      });
    },
    onProxyRes: (proxyRes) => {
      console.log('[GATEWAY] Response:', proxyRes.statusCode);
    },
    onError: (err, req, res) => {
      console.error('[GATEWAY ERROR]', err.message);
      if (res && !res.headersSent) res.status(502).json({ message: 'Service unavailable', service: target });
    }
  });


// User Service Proxy
exports.userProxy = buildProxy(
  process.env.USER_SERVICE_URL,
  '/api/users'
);

// Billing Service Proxy
exports.billingProxy = buildProxy(
  process.env.BILLING_SERVICE_URL,
  '/api/billing'
);

// Payment Service Proxy
exports.paymentProxy = buildProxy(
  process.env.PAYMENT_SERVICE_URL,
  '/api/payments'
);

// Provisioning Service Proxy   
exports.provisioningProxy = buildProxy(
  process.env.PROVISIONING_SERVICE_URL,
  '/api/provisioning'
);

// Chat Service Proxy
exports.chatProxy = buildProxy(
  process.env.CHAT_SERVICE_URL,
  '',
  true
);
