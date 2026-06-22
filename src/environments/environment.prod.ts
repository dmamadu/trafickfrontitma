export const environment = {
  production: true,
  defaultauth: "fakebackend",
  apiUrl: "https://api.invodis.com/",
  batchApiURL: 'https://sfp.suntelecoms.com/batchapi/',
  apicomURL: 'https://api.suntelecoms.com/comapi/',
  max: 100000,
  offset: 0,
  sessionExpirationTime: 600,
  // Injectée au build via la CI/CD (variable d'env NG_APP_ENCRYPT_SALT)
  ENCRYPT_SALT: (window as any).__ENV_ENCRYPT_SALT__ || "",
  ENCRYPT_KEY: (window as any).__ENV_ENCRYPT_KEY__ || "",
};
