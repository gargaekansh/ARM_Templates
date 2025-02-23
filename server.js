import express from 'express';
import open from 'open';
import crypto from 'crypto';
import axios from 'axios';
import session from 'express-session';
import https from 'https';

const app = express();
const port = 3000;

const config = {
  authority: "https://localhost:44370",
  client_id: "your-client-id",
  redirect_uri: "https://your-app/callback",
  response_type: "code",
  scope: "openid profile offline_access catalogapi.fullaccess basketapi.read basketapi.fullaccess discount.fullaccess shoppinggateway.fullaccess orderapi.fullaccess shoppingaggregator.fullaccess paymentapi.fullaccess deliveryapi.fullaccess ordersagaorchestrator.fullaccess IdentityServerApi",
  post_logout_redirect_uri: "https://your-app/logout",
  automaticSilentRenew: true,
  silent_redirect_uri: "https://your-app/silent-renew",
  metadata: {
    issuer: "https://localhost:44370",
    jwks_uri: "https://localhost:44370/.well-known/openid-configuration/jwks",
    authorization_endpoint: "https://localhost:44370/connect/authorize",
    token_endpoint: "https://localhost:44370/connect/token",
    userinfo_endpoint: "https://localhost:44370/connect/userinfo",
    end_session_endpoint: "https://localhost:44370/connect/endsession",
    check_session_iframe: "https://localhost:44370/connect/checksession",
    revocation_endpoint: "https://localhost:44370/connect/revocation",
    introspection_endpoint: "https://localhost:44370/connect/introspect",
    device_authorization_endpoint: "https://localhost:44370/connect/deviceauthorization",
    frontchannel_logout_supported: true,
    frontchannel_logout_session_supported: true,
    backchannel_logout_supported: true,
    backchannel_logout_session_supported: true,
    scopes_supported: [
      "openid", "profile", "address", "roles", "catalogapi.fullaccess", "catalogapi.read", "basketapi.read", "basketapi.fullaccess", "discount.fullaccess", "shoppinggateway.fullaccess", "orderapi.fullaccess", "shoppingaggregator.fullaccess", "paymentapi.fullaccess", "deliveryapi.fullaccess", "ordersagaorchestrator.fullaccess", "IdentityServerApi", "offline_access"
    ],
    claims_supported: [
      "sub", "name", "family_name", "given_name", "middle_name", "nickname", "preferred_username", "profile", "picture", "website", "gender", "birthdate", "zoneinfo", "locale", "updated_at", "address", "role"
    ],
    grant_types_supported: [
      "authorization_code", "client_credentials", "refresh_token", "implicit", "password", "urn:ietf:params:oauth:grant-type:device_code"
    ],
    response_types_supported: [
      "code", "token", "id_token", "id_token token", "code id_token", "code token", "code id_token token"
    ],
    response_modes_supported: [
      "form_post", "query", "fragment"
    ],
    token_endpoint_auth_methods_supported: [
      "client_secret_basic", "client_secret_post"
    ],
    id_token_signing_alg_values_supported: ["RS256"],
    subject_types_supported: ["public"],
    code_challenge_methods_supported: ["plain", "S256"],
    request_parameter_supported: true
  }
};


const agent = new https.Agent({
  rejectUnauthorized: false // INSECURE FOR PRODUCTION - ONLY FOR LOCAL TESTING
});

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(codeVerifier) {
  const hash = crypto.createHash('sha256');
  hash.update(codeVerifier);
  return hash.digest('base64url');
}

const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);

app.use(express.json());
app.use(session({
  secret: 'your_strong_secret_key', // **REPLACE THIS WITH A STRONG, RANDOM SECRET IN PRODUCTION**
  resave: false,
  saveUninitialized: true,
}));

async function testIdentityServerAuthentication(username, password, clientId, clientSecret, scopes) {
  try {
    const tokenResponse = await axios.post('https://localhost:44370/connect/token', {
      grant_type: 'password', // ROPC grant
      username: username,
      password: password,
      client_id: clientId,
      client_secret: clientSecret, // Only if required by your client config
      scope: scopes,
    }, { httpsAgent: agent });

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;

    console.log('IdentityServer4 Authentication Successful!');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    return { accessToken, refreshToken };

  } catch (error) {
    console.error('IdentityServer4 Authentication Failed:', error); // Log the whole error object
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
    throw error; // Re-throw the error to be caught by the .catch block
  }
}

// Example usage:
const username = 'administrator@localhost'; // Replace with your test user's username
const password = 'Administrator1';      // Replace with your test user's password
const clientId = 'angular-client'; // Replace with your client ID
const clientSecret = 'ShoppingPasswordClientSecret'; // Replace with your client secret (if required)
const scopes = 'openid profile offline_access shoppinggateway.fullaccess catalogapi.fullaccess'; // Replace with your scopes

testIdentityServerAuthentication(username, password, clientId, clientSecret, scopes)
  .then(tokens => {
    console.log("Tokens received:", tokens);

    // Example: Make a request to a protected API endpoint (replace with your actual endpoint)
    axios.get('your_protected_api_endpoint', { // Replace with your actual endpoint
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      httpsAgent: agent, // Use the agent for API requests as well (if needed)
    })
    .then(apiResponse => {
      console.log('API Response:', apiResponse.data);
    })
    .catch(apiError => {
      console.error('API Error:', apiError);
      if (apiError.response) {
        console.error('API Response Data:', apiError.response.data);
      }
    });

  })
  .catch(error => {
    console.error('Top-Level Error:', error); // Catch and log any errors from the promise
  });

// ... (rest of your code - express app setup, etc. - if you need it)

// const app = express();
// const port = 3000;

// function generateCodeVerifier() {
//   return crypto.randomBytes(32).toString('base64url');
// }

// function generateCodeChallenge(codeVerifier) {
//   const hash = crypto.createHash('sha256');
//   hash.update(codeVerifier);
//   return hash.digest('base64url');
// }

// const codeVerifier = generateCodeVerifier();
// const codeChallenge = generateCodeChallenge(codeVerifier);

// app.use(express.json());
// app.use(session({
//   secret: 'your_strong_secret_key', // **REPLACE THIS WITH A STRONG, RANDOM SECRET IN PRODUCTION**
//   resave: false,
//   saveUninitialized: true,
// }));

// app.get('/', async (req, res) => {
//   const authorizationCode = req.query.code;

//   if (authorizationCode) {
//     console.log(`Authorization Code: ${authorizationCode}`);

//     try {
//       const tokenResponse = await axios.post('https://localhost:44370/connect/token', {
//         grant_type: 'authorization_code',
//         code: authorizationCode,
//         redirect_uri: `http://localhost:${port}`,
//         client_id: 'angular-client',
//         code_verifier: codeVerifier,
//       });

//       const accessToken = tokenResponse.data.access_token;
//       const refreshToken = tokenResponse.data.refresh_token;

//       console.log(`Access Token: ${accessToken}`);
//       console.log(`Refresh Token: ${refreshToken}`);

//       req.session.accessToken = accessToken;
//       req.session.refreshToken = refreshToken;

//       res.send('Authorization complete. Tokens received. Check the console.');

//     } catch (error) {
//       console.error('Error getting tokens:', error.response ? error.response.data : error.message);
//       res.status(500).send(`Error during token exchange: ${error.message}`);
//     }
//   } else {
//     res.send('No authorization code received.');
//   }
// });

// app.get('/refresh_token', async (req, res) => {
//     const refreshToken = req.session.refreshToken;

//     if (!refreshToken) {
//       return res.status(400).send('No refresh token available.  Login again.');
//     }

//     try {
//       const refreshResponse = await axios.post('https://localhost:44370/connect/token', {
//         grant_type: 'refresh_token',
//         refresh_token: refreshToken,
//         client_id: 'angular-client',
//       });

//       const newAccessToken = refreshResponse.data.access_token;
//       const newRefreshToken = refreshResponse.data.refresh_token || refreshToken;

//       console.log('New Access Token:', newAccessToken);
//       console.log('New Refresh Token:', newRefreshToken);

//       req.session.accessToken = newAccessToken;
//       req.session.refreshToken = newRefreshToken;

//       res.send('Token refreshed successfully.');

//     } catch (error) {
//         console.error('Error refreshing token:', error.response ? error.response.data : error.message);
//         res.status(500).send(`Error refreshing token: ${error.message}`);
//     }
//   });


// const server = app.listen(port, () => {
//   console.log(`Listening on http://localhost:${port}`);

//   const authUrl = `https://localhost:44370/connect/authorize?response_type=code&client_id=angular-client&redirect_uri=http://localhost:${port}&scope=openid profile offline_access shoppinggateway.fullaccess&state=random_state_value&code_challenge=${codeChallenge}&code_challenge_method=S256`;

//   console.log(`Authorization URL: ${authUrl}`);

//   open(authUrl);
// });

// console.log(`Code Verifier: ${codeVerifier}`);
// console.log(`Code Challenge: ${codeChallenge}`);



// const express = require('express');
// const open = require('open');
// const crypto = require('crypto');
// const axios = require('axios');
// const session = require('express-session');

// const app = express();
// const port = 3000;

// // Generate PKCE values
// function generateCodeVerifier() {
//   return crypto.randomBytes(32).toString('base64url');
// }

// function generateCodeChallenge(codeVerifier) {
//   const hash = crypto.createHash('sha256');
//   hash.update(codeVerifier);
//   return hash.digest('base64url');
// }

// const codeVerifier = generateCodeVerifier();
// const codeChallenge = generateCodeChallenge(codeVerifier);

// app.use(express.json());
// app.use(session({
//   secret: 'ShoppingPasswordClientSecret', // **REPLACE THIS WITH A STRONG, RANDOM SECRET IN PRODUCTION**
//   resave: false,
//   saveUninitialized: true,
// }));

// app.get('/', async (req, res) => {
//   const authorizationCode = req.query.code;

//   if (authorizationCode) {
//     console.log(`Authorization Code: ${authorizationCode}`);

//     try {
//       const tokenResponse = await axios.post('https://localhost:44370/connect/token', { // Your IdentityServer4 token endpoint
//         grant_type: 'authorization_code',
//         code: authorizationCode,
//         redirect_uri: `http://localhost:${port}`, // MUST MATCH EXACTLY
//         client_id: 'angular-client', // Your client ID
//         code_verifier: codeVerifier, // PKCE
//       });

//       const accessToken = tokenResponse.data.access_token;
//       const refreshToken = tokenResponse.data.refresh_token;

//       console.log(`Access Token: ${accessToken}`);
//       console.log(`Refresh Token: ${refreshToken}`);

//       // Store tokens in session (INSECURE FOR PRODUCTION - use a proper store like a database or Redis)
//       req.session.accessToken = accessToken;
//       req.session.refreshToken = refreshToken;

//       res.send('Authorization complete. Tokens received. Check the console.');

//     } catch (error) {
//       console.error('Error getting tokens:', error.response ? error.response.data : error.message);
//       res.status(500).send(`Error during token exchange: ${error.message}`); // More informative error message
//     }
//   } else {
//     res.send('No authorization code received.');
//   }
// });


// app.get('/refresh_token', async (req, res) => {
//   const refreshToken = req.session.refreshToken;

//   if (!refreshToken) {
//     return res.status(400).send('No refresh token available.  Login again.');
//   }

//   try {
//     const refreshResponse = await axios.post('https://localhost:44370/connect/token', { // Your IdentityServer4 token endpoint
//       grant_type: 'refresh_token',
//       refresh_token: refreshToken,
//       client_id: 'angular-client', // Your client ID
//     });

//     const newAccessToken = refreshResponse.data.access_token;
//     const newRefreshToken = refreshResponse.data.refresh_token || refreshToken; // Refresh token might not be new

//     console.log('New Access Token:', newAccessToken);
//     console.log('New Refresh Token:', newRefreshToken);

//     req.session.accessToken = newAccessToken;
//     req.session.refreshToken = newRefreshToken;

//     res.send('Token refreshed successfully.');

//   } catch (error) {
//       console.error('Error refreshing token:', error.response ? error.response.data : error.message);
//       res.status(500).send(`Error refreshing token: ${error.message}`);
//   }
// });


// const server = app.listen(port, () => {
//   console.log(`Listening on http://localhost:${port}`);

//   const authUrl = `https://localhost:44370/connect/authorize?response_type=code&client_id=angular-client&redirect_uri=http://localhost:${port}&scope=openid profile offline_access shoppinggateway.fullaccess&state=random_state_value&code_challenge=${codeChallenge}&code_challenge_method=S256`;

//   console.log(`Authorization URL: ${authUrl}`); // Log the full auth URL

//   open(authUrl);
// });

// console.log(`Code Verifier: ${codeVerifier}`); // Log the code verifier (for debugging)
// console.log(`Code Challenge: ${codeChallenge}`); // Log the code challenge (for debugging)




















// // import open from 'open';
// // import express from 'express';
// // import crypto from 'crypto';
// // import axios from 'axios';

// // // Function to generate code_verifier
// // function generateCodeVerifier() {
// //   return crypto.randomBytes(32).toString('base64url');
// // }

// // // Function to generate code_challenge using SHA-256
// // function generateCodeChallenge(codeVerifier) {
// //   const hash = crypto.createHash('sha256');
// //   hash.update(codeVerifier);
// //   const codeChallenge = hash.digest('base64url');
// //   return codeChallenge;
// // }

// // // Initialize Express app
// // const app = express();
// // const port = 3000;

// // // Generate the code_verifier and code_challenge
// // const codeVerifier = generateCodeVerifier();
// // const codeChallenge = generateCodeChallenge(codeVerifier);

// // // Log the generated values
// // console.log(`Code Verifier: ${codeVerifier}`);
// // console.log(`Code Challenge: ${codeChallenge}`);

// // app.use(express.json()); // Add middleware for parsing JSON

// // // Simulate user authentication before proceeding to OAuth
// // async function authenticateUser() {
// //   try {
// //     // Manually login by sending credentials to your backend API
// //     const loginResponse = await axios.post('http://localhost:3000/login', {
// //       email: 'administrator@localhost',  // Test user email
// //       password: 'Administrator1',        // Test user password
// //       rememberMe: true,
// //       returnUrl: 'http://localhost:3000'
// //     });

// //     console.log('User logged in successfully:', loginResponse.data);
// //     return true; // User authenticated
// //   } catch (error) {
// //     console.error('Login failed:', error);
// //     return false; // Login failed
// //   }
// // }

// // // Handle the OAuth2 redirect URI callback
// // app.get('/', async (req, res) => {
// //   const authorizationCode = req.query.code;

// //   if (authorizationCode) {
// //     console.log(`Authorization Code: ${authorizationCode}`);

// //     // Ensure the user is authenticated before proceeding
// //     const userAuthenticated = await authenticateUser();
// //     if (!userAuthenticated) {
// //       res.status(401).send('Authentication failed.');
// //       return;
// //     }

// //     // Exchange the authorization code for an access token
// //     try {
// //       const tokenResponse = await axios.post('https://localhost:44370/connect/token', {
// //         grant_type: 'authorization_code',
// //         code: authorizationCode,
// //         redirect_uri: 'http://localhost:3000',
// //         client_id: 'angular-client',
// //         code_verifier: codeVerifier,
// //       });

// //       const accessToken = tokenResponse.data.access_token;
// //       console.log(`Access Token: ${accessToken}`);

// //       res.send('Authorization Code received and User logged in successfully.');
// //     } catch (error) {
// //       console.error('Error exchanging authorization code or logging in:', error);
// //       res.status(500).send('Error during OAuth2 flow or login');
// //     }
// //   } else {
// //     console.log('No authorization code found.');
// //     res.send('Authorization code missing.');
// //   }
// // });

// // // Start listening for the redirect URI
// // app.listen(port, () => {
// //   console.log(`Listening for OAuth2 redirect on http://localhost:${port}`);

// //   // Generate the URL with code_challenge
// //   const authUrl = `https://localhost:44370/connect/authorize?response_type=code&client_id=angular-client&redirect_uri=http://localhost:3000&scope=openid%20profile%20offline_access%20shoppinggateway.fullaccess&state=random_state_value&code_challenge=${codeChallenge}&code_challenge_method=S256`;

// //   console.log(`Opening URL: ${authUrl}`);

// //   // Open the browser automatically to the authorization URL
// //   open(authUrl);
// // });
