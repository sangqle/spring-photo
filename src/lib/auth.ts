import CredentialsProvider from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import type { Account, NextAuthConfig, Profile, Session, User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';
import { API_BASE_URL } from './config';

interface SignUpPayload {
  email: string;
  password: string;
}

interface Credentials {
  usernameOrEmail: string;
  password: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface LoginSuccessResponse {
  token: string;
  type: string | null;
  id: string | number;
  username: string;
  email: string;
  role: string;
}

export async function signUp(email: string, password: string): Promise<void> {
  const payload: SignUpPayload = { email, password };

  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, 'Registration failed'));
  }
}

async function extractErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const errorBody = (await response.json()) as ApiErrorResponse;
    if (errorBody?.message) {
      return errorBody.message;
    }
    if (errorBody?.error) {
      return errorBody.error;
    }
    if (errorBody?.errors && errorBody.errors.length > 0) {
      return errorBody.errors.map((error) => error.message).join(', ');
    }
  } catch (error) {
    // Ignore JSON parse errors and fall back to default message.
  }

  return fallbackMessage;
}

type ExtendedJWT = JWT & { accessToken?: string; role?: string };
type SessionUser = Session['user'] & { id?: string; accessToken?: string; role?: string };
type JWTCallbackParams = {
  token: JWT;
  user?: User | AdapterUser | null;
  account?: Account | null;
  profile?: Profile;
  trigger?: 'signIn' | 'signUp' | 'update';
  isNewUser?: boolean;
  session?: Session;
};
type SessionCallbackParams = {
  session: Session;
  token: JWT;
  user?: AdapterUser;
  newSession?: Session;
  trigger?: 'update';
};

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        usernameOrEmail: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = credentials as Credentials | null;
        if (!parsedCredentials?.usernameOrEmail || !parsedCredentials.password) {
          throw new CredentialsSignin('Username or email and password are required');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              usernameOrEmail: parsedCredentials.usernameOrEmail,
              password: parsedCredentials.password,
            }),
          });

          if (!response.ok) {
            const message = await extractErrorMessage(response, 'Invalid username/email or password');
            throw new CredentialsSignin(message);
          }

          const data = (await response.json()) as LoginSuccessResponse;
          const userId = String(data.id ?? data.username);

          return {
            id: userId,
            email: data.email,
            name: data.username,
            accessToken: data.token,
            role: data.role,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }

          const message =
            error instanceof Error
              ? error.message
              : 'Unable to reach the authentication service';
          throw new CredentialsSignin(message);
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: JWTCallbackParams): Promise<ExtendedJWT> {
      const extendedToken = token as ExtendedJWT;
      if (user) {
        const { accessToken, role } = user as { accessToken?: string; role?: string };
        extendedToken.accessToken = accessToken;
        extendedToken.role = role;
      }
      return extendedToken;
    },
    async session({ session, token }: SessionCallbackParams): Promise<Session> {
      if (session?.user) {
        const sessionUser = session.user as SessionUser;
        sessionUser.id = token.sub ?? sessionUser.id;
        sessionUser.accessToken = (token as ExtendedJWT).accessToken;
        sessionUser.role = (token as ExtendedJWT).role;
      }
      return session;
    },
  },
};
