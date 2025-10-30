'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Compass, Menu, Search, Upload, X } from 'lucide-react';

type NavItem = {
    href: string;
    label: string;
    description: string;
    icon: React.ElementType;
    variant: 'neutral' | 'primary';
};

const navItems: NavItem[] = [
    {
        href: '/feed',
        label: 'Explore',
        description: 'Discover trending photographers',
        icon: Compass,
        variant: 'neutral',
    },
    {
        href: '/upload',
        label: 'Upload',
        description: 'Share your latest work',
        icon: Upload,
        variant: 'primary',
    },
];

const inputStyles =
    'w-full bg-card text-white placeholder-gray-400 px-4 py-2 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition';

const SearchBar = ({
    placeholder,
    className = '',
}: {
    placeholder: string;
    className?: string;
}) => (
    <div className={['relative', className].filter(Boolean).join(' ')}>
        <input type="text" placeholder={placeholder} className={inputStyles} />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
);

const UserAvatar = ({
    name,
    email,
    image,
}: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
}) => {
    const fallback = (name ?? email ?? '?').charAt(0).toUpperCase();

    if (image) {
        return (
            <span className="h-9 w-9 overflow-hidden rounded-full border border-gray-700 bg-card">
                <img src={image} alt={name ?? email ?? 'User avatar'} className="h-full w-full object-cover" />
            </span>
        );
    }

    return (
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 bg-card text-sm font-semibold text-white">
            {fallback}
        </span>
    );
};

const Header: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    const displayName = session?.user?.name ?? session?.user?.email ?? 'Your space';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-card-darker/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white transition-colors hover:text-blue-400"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                            <Camera className="h-5 w-5" />
                        </span>
                        <span className="hidden text-xl font-semibold sm:block">PhotoShare</span>
                    </Link>

                    <div className="hidden flex-1 md:flex">
                        <SearchBar placeholder="Search photos, people, or collections" className="w-full" />
                    </div>

                    <nav className="hidden items-center gap-3 md:flex">
                        {navItems.map(({ href, label, description, icon: Icon, variant }) => {
                            const isActive = pathname?.startsWith(href);
                            const baseStyles =
                                'group flex items-center gap-3 rounded-2xl border px-4 py-2 transition-colors';
                            const activeStyles =
                                variant === 'primary'
                                    ? 'border-blue-500/40 bg-blue-500/15 text-white hover:border-blue-400/70 hover:bg-blue-500/25'
                                    : 'border-gray-800 bg-card hover:border-gray-700 hover:bg-card/80 text-white';
                            const inactiveStyles =
                                variant === 'primary'
                                    ? 'border-blue-500/20 bg-blue-500/10 text-blue-200 hover:border-blue-500/40 hover:bg-blue-500/20'
                                    : 'border-gray-800 bg-card hover:border-gray-700 hover:bg-card/80 text-gray-200';

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
                                >
                                    <span
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                                            variant === 'primary'
                                                ? 'border-blue-400/40 bg-blue-500/20 text-blue-100'
                                                : 'border-gray-700 bg-card-darker text-gray-300'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="flex flex-col text-left">
                                        <span className="text-sm font-semibold leading-tight">{label}</span>
                                        <span className="text-xs text-gray-400">{description}</span>
                                    </span>
                                </Link>
                            );
                        })}

                        <Link
                            href="/portfolio"
                            className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-card px-3 py-2 transition hover:border-gray-700 hover:bg-card/80"
                        >
                            <UserAvatar
                                name={session?.user?.name}
                                email={session?.user?.email}
                                image={session?.user?.image}
                            />
                            <span className="hidden flex-col text-left lg:flex">
                                <span className="text-sm font-semibold text-white">{displayName}</span>
                                <span className="text-xs text-gray-400">Your portfolio</span>
                            </span>
                        </Link>
                    </nav>

                    <button
                        type="button"
                        onClick={toggleMobileMenu}
                        className="md:hidden text-white"
                        aria-label="Toggle navigation"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                    </button>
                </div>

                {mobileMenuOpen ? (
                    <div className="md:hidden space-y-4 border-t border-gray-800 py-4">
                        <SearchBar placeholder="Search photos..." />
                        <nav className="space-y-3">
                            {navItems.map(({ href, label, description, icon: Icon }) => {
                                const isActive = pathname?.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={closeMobileMenu}
                                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                                            isActive
                                                ? 'border-blue-500/40 bg-blue-500/15 text-white'
                                                : 'border-gray-800 bg-card hover:border-gray-700 hover:bg-card/80 text-gray-200'
                                        }`}
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 bg-card-darker text-gray-300">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="flex flex-col text-left">
                                            <span className="text-sm font-semibold leading-tight">{label}</span>
                                            <span className="text-xs text-gray-400">{description}</span>
                                        </span>
                                    </Link>
                                );
                            })}

                            <Link
                                href="/portfolio"
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-card px-4 py-3 text-gray-200 transition hover:border-gray-700 hover:bg-card/80"
                            >
                                <UserAvatar
                                    name={session?.user?.name}
                                    email={session?.user?.email}
                                    image={session?.user?.image}
                                />
                                <span className="flex flex-col text-left">
                                    <span className="text-sm font-semibold leading-tight text-white">{displayName}</span>
                                    <span className="text-xs text-gray-400">Manage your portfolio</span>
                                </span>
                            </Link>
                        </nav>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

export default Header;