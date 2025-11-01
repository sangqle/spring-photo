"use client";

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const SettingsPage: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const userHandle = (user as { username?: string; handle?: string } | undefined)?.username ??
    (user as { handle?: string } | undefined)?.handle ??
    user?.name ??
    null;
  const portfolioHref = userHandle ? `/${encodeURIComponent(userHandle.toString())}` : '/login';

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Profile Settings</h1>
        <p className="text-sm text-gray-400">
          Manage your account details and sign out of PhotoShare.
        </p>
      </header>

      <section className="rounded-3xl border border-gray-800 bg-card p-6 shadow-lg shadow-black/10 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-sm text-gray-400">Signed in as</div>
            <div className="text-base font-medium text-white">{user?.name ?? user?.email ?? 'Unknown user'}</div>
            {user?.email ? (
              <div className="text-sm text-gray-500">{user.email}</div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={portfolioHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              View Portfolio
            </Link>
            <button
              type="button"
              onClick={() => {
                void signOut({ callbackUrl: '/' });
              }}
              className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-800 bg-card p-6 shadow-lg shadow-black/10 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <p className="mt-2 text-sm text-gray-400">
          Editing profile details is coming soon. In the meantime you can continue sharing your work in the portfolio section.
        </p>
      </section>
    </div>
  );
};

export default SettingsPage;
