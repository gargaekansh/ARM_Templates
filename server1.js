import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import session from 'express-session';
import https from 'https';
import qs from 'qs';  // ✅ Required for form-encoded data

const app = express();
const port = 3000;

// 🔐 IdentityServer4 Configuration
const config = {
  authority: "https://localhost:44370",  
  client_id: "node-client",  
  client_secret: "NodeClientSecret", 
  redirect_uri: "https://your-app/callback", 
  response_type: "code",  
  scope: "openid profile roles offline_access shoppinggateway.fullaccess catalogapi.fullaccess", 
  post_logout_redirect_uri: "https://your-app/logout",
  token_endpoint: "https://localhost:44370/connect/token", 
  protected_api_endpoint: "https://your-protected-api.com/endpoint",  //protected_api_endpoint: "https://localhost:5001/api/products" // 🔄 Example API
};

// 🔓 Insecure Agent for Local Testing (DO NOT USE IN PRODUCTION)
const agent = new https.Agent({
  rejectUnauthorized: false
});

// 🔐 Generate PKCE Code Verifier & Code Challenge
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(codeVerifier) {
  return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
}

const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);

// 🔄 Middleware
app.use(express.json());
app.use(session({
  secret: 'your_strong_secret_key', 
  resave: false,
  saveUninitialized: true,
}));

// 🛂 Function to Authenticate User with IdentityServer4
async function authenticateUser(username, password) {
  try {
    const data = qs.stringify({
      grant_type: 'password',  // ROPC (Resource Owner Password Credentials) Grant Type
      username,
      password,
      client_id: config.client_id,
      client_secret: config.client_secret,
      scope: config.scope
    });

    const response = await axios.post(config.token_endpoint, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  // Form URL-encoded
      httpsAgent: agent 
    });

    const { access_token, refresh_token } = response.data;
    console.log("✅ Authentication Successful!");
    console.log("🔑 Access Token:", access_token);
    console.log("🔄 Refresh Token:", refresh_token);

    return { access_token, refresh_token };

  } catch (error) {
    console.error("❌ Authentication Failed:", error.message);
    if (error.response) {
      console.error("🔍 Response Data:", error.response.data);
    }
    throw error;
  }
}

// 📡 Function to Call a Protected API
async function callProtectedAPI(accessToken) {
  try {
    const response = await axios.get(config.protected_api_endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
      httpsAgent: agent
    });

    console.log("✅ API Response:", response.data);

  } catch (error) {
    console.error("❌ API Request Failed:", error.message);
    if (error.response) {
      console.error("🔍 API Response Data:", error.response.data);
    }
  }
}

// 🔄 Example Usage
const username = "administrator@localhost";  
const password = "Administrator1!";          

authenticateUser(username, password)
  .then(tokens => callProtectedAPI(tokens.access_token))
  .catch(error => console.error("❌ Error in Process:", error.message));

// 🚀 Start Express Server (Optional)
app.listen(port, () => {
  console.log(`🔗 Server running on http://localhost:${port}`);
});
