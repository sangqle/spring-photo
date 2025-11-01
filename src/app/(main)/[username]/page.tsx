import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import PortfolioClient, { PortfolioOwnerInfo } from './PortfolioClient';

interface PortfolioOwnerResponse {
  username?: string;
  name?: string;
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  profileImageUrl?: string | null;
  profile?: {
    bio?: string | null;
    avatarUrl?: string | null;
    displayName?: string | null;
  };
}

async function fetchOwner(baseUrl: string, username: string): Promise<PortfolioOwnerInfo | null> {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const response = await fetch(`${normalizedBase}/api/users/${encodeURIComponent(username)}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  console.log('fetchOwner response status:', response);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load portfolio for ${username}`);
  }

  const payload = (await response.json()) as PortfolioOwnerResponse;
  const inferredUsername = payload.username ?? username;
  const inferredDisplayName = payload.displayName ?? payload.name ?? payload.profile?.displayName ?? inferredUsername;
  const inferredBio = payload.bio ?? payload.profile?.bio ?? null;
  const inferredAvatar = payload.avatarUrl ?? payload.profileImageUrl ?? payload.profile?.avatarUrl ?? null;

  return {
    username: inferredUsername,
    displayName: inferredDisplayName,
    bio: inferredBio,
    avatarUrl: inferredAvatar,
  };
}

interface PageProps {
  params: Promise<{
    username?: string;
  }>;
}

const sanitizeUsername = (rawUsername: string | undefined): string | null => {
  if (!rawUsername) {
    return null;
  }

  let decoded = rawUsername;
  try {
    decoded = decodeURIComponent(rawUsername);
  } catch {
    decoded = rawUsername;
  }

  const trimmed = decoded.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed === 'undefined' || trimmed === 'null' || trimmed === 'NaN') {
    return null;
  }

  return trimmed;
};

const UserPortfolioPage = async ({ params }: PageProps) => {
  // Await params in Next.js 15
  const resolvedParams = await params;
  
  // Get user name from url params
  console.log('params:', resolvedParams);
  const requestedUsername = sanitizeUsername(resolvedParams?.username);

  if (!requestedUsername) {
    notFound();
  }
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const owner = await fetchOwner(baseUrl, requestedUsername);

  if (!owner) {
    notFound();
  }

  const session = await auth();
  const sessionUser = session?.user as { username?: string; handle?: string; name?: string } | undefined;
  const sessionHandle =
    sessionUser?.username ??
    sessionUser?.handle ??
    sessionUser?.name ??
    (typeof session?.user?.email === 'string' ? session.user.email.split('@')[0] : undefined);
  const isOwner = sessionHandle
    ? sessionHandle.localeCompare(requestedUsername, undefined, { sensitivity: 'accent', usage: 'search' }) === 0
    : false;

  return <PortfolioClient username={requestedUsername} owner={owner} isOwner={isOwner} />;
};

export default UserPortfolioPage;
