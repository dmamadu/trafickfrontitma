export const environment = {
  production: false,
  defaultauth: "fakebackend",
  apiUrl: "https://api.invodis.com/",
  batchApiURL: 'https://sfp.suntelecoms.com/batchapi/',
  apicomURL: 'https://api.suntelecoms.com/comapi/',
  max: 100000,
  offset: 0,
  sessionExpirationTime: 600,
  ENCRYPT_SALT: (window as any).__ENV_ENCRYPT_SALT__ || "",
  ENCRYPT_KEY: (window as any).__ENV_ENCRYPT_KEY__ || "",
};
