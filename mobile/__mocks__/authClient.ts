const authClient = {
  getCookie: jest.fn(() => ''),
  getSession: jest.fn(async () => ({ data: null, error: null })),
  signIn: {
    email: jest.fn(async () => ({ data: null, error: null })),
  },
  signUp: {
    email: jest.fn(async () => ({ data: null, error: null })),
  },
  signOut: jest.fn(async () => ({ data: null, error: null })),
  deleteUser: jest.fn(async () => ({ data: null, error: null })),
  requestPasswordReset: jest.fn(async () => ({ data: { status: true }, error: null })),
  resetPassword: jest.fn(async () => ({ data: { status: true }, error: null })),
};

export { authClient };
export default authClient;
