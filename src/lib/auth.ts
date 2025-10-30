import CredentialsProvider from 'next-auth/providers/credentials';
import type { Account, NextAuthConfig, Profile, Session, User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface SignUpPayload {
  email: string;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface LoginSuccessResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  };
}

export async function signUp(email: string, password: string): Promise<void> {
  const payload: SignUpPayload = { email, password };

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
    if (errorBody?.errors && errorBody.errors.length > 0) {
      return errorBody.errors.map((error) => error.message).join(', ');
    }
  } catch (error) {
    // Ignore JSON parse errors and fall back to default message.
  }

  return fallbackMessage;
}

type ExtendedJWT = JWT & { accessToken?: string };
type SessionUser = Session['user'] & { id?: string; accessToken?: string };
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
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = credentials as Credentials | null;
        if (!parsedCredentials?.email || !parsedCredentials.password) {
          throw new Error('Email and password are required');
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: parsedCredentials.email,
            password: parsedCredentials.password,
          }),
        });

        if (!response.ok) {
          const message = await extractErrorMessage(response, 'Invalid email or password');
          throw new Error(message);
        }

        const data = (await response.json()) as LoginSuccessResponse;
        const { user, token } = data;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          accessToken: token,
        };
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
        extendedToken.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return extendedToken;
    },
    async session({ session, token }: SessionCallbackParams): Promise<Session> {
      if (session?.user) {
        const sessionUser = session.user as SessionUser;
        sessionUser.id = token.sub ?? sessionUser.id;
        sessionUser.accessToken = (token as ExtendedJWT).accessToken;
      }
      return session;
    },
  },
};
