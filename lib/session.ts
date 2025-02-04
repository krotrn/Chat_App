export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'authentication',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};
