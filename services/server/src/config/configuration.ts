export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT) ?? 3000,
    version: process.env.APP_VERSION ?? '1.0',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'this-is-a-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
});
