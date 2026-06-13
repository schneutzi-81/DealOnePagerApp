import { PublicClientApplication, Configuration, AccountInfo } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

const loginScopes = {
  scopes: [`api://${import.meta.env.VITE_AZURE_CLIENT_ID}/access_as_user`],
};

export async function initializeAuth(): Promise<void> {
  await msalInstance.initialize();
  // Handle redirect response if returning from login
  await msalInstance.handleRedirectPromise();
}

export async function login(): Promise<void> {
  await msalInstance.loginRedirect(loginScopes);
}

export async function logout(): Promise<void> {
  await msalInstance.logoutRedirect();
}

export function getActiveAccount(): AccountInfo | null {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export async function getAccessToken(): Promise<string> {
  const account = getActiveAccount();
  if (!account) {
    throw new Error('No active account. Please login.');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginScopes,
      account,
    });
    return response.accessToken;
  } catch {
    // Silent token acquisition failed — redirect to login
    await msalInstance.acquireTokenRedirect(loginScopes);
    throw new Error('Redirecting to login...');
  }
}
