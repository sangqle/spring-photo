'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Compass, Menu, Search, Upload, X } from 'lucide-react';

type NavItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    variant: 'neutral' | 'primary';
};

const navItems: NavItem[] = [
    {
        href: '/feed',
        label: 'Explore',
        icon: Compass,
        variant: 'neutral',
    },
    {
        href: '/upload',
        label: 'Upload',
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
    const portfolioActive = pathname?.startsWith('/portfolio');

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

                    <nav className="hidden items-center md:flex">
                        {navItems.map(({ href, label, icon: Icon, variant }) => {
                            const isActive = pathname?.startsWith(href);
                            const baseStyles =
                                "group relative flex h-12 items-center rounded-2xl px-4 transition-colors after:pointer-events-none after:absolute after:left-4 after:right-4 after:-bottom-1 after:h-0.5 after:rounded-full after:content-[''] after:transition-opacity";
                            const activeStyles = 'text-white';
                            const inactiveStyles =
                                variant === 'primary'
                                    ? 'text-blue-200 hover:text-white'
                                    : 'text-gray-200 hover:text-white';
                            const iconActiveStyles = variant === 'primary' ? 'text-blue-200' : 'text-white';
                            const iconInactiveStyles = variant === 'primary' ? 'text-blue-200/80' : 'text-gray-300';
                            const highlightActive =
                                variant === 'primary'
                                    ? 'after:bg-blue-400 after:opacity-100'
                                    : 'after:bg-white/80 after:opacity-100';
                            const highlightInactive =
                                variant === 'primary'
                                    ? 'after:bg-blue-400 after:opacity-0 hover:after:opacity-70'
                                    : 'after:bg-white/60 after:opacity-0 hover:after:opacity-60';

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`${baseStyles} ${isActive ? `${activeStyles} ${highlightActive}` : `${inactiveStyles} ${highlightInactive}`}`}
                                >
                                    <span
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                                            isActive ? iconActiveStyles : iconInactiveStyles
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="text-sm font-semibold leading-tight text-left">{label}</span>
                                </Link>
                            );
                        })}

                        <Link
                            href="/portfolio"
                            aria-current={portfolioActive ? 'page' : undefined}
                            className={`relative flex h-12 items-center gap-2 rounded-2xl px-3 transition after:pointer-events-none after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:rounded-full after:content-[''] after:transition-opacity ${
                                portfolioActive
                                    ? 'text-white after:bg-white/80 after:opacity-100'
                                    : 'text-white/80 hover:text-white after:bg-white/60 after:opacity-0 hover:after:opacity-60'
                            }`}
                        >
                            <UserAvatar
                                name={session?.user?.name}
                                email={session?.user?.email}
                                image={session?.user?.image}
                            />
                            <span className="hidden text-sm font-semibold text-white lg:block">{displayName}</span>
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
                            {navItems.map(({ href, label, icon: Icon, variant }) => {
                                const isActive = pathname?.startsWith(href);
                                const itemClasses = isActive
                                    ? 'text-white'
                                    : variant === 'primary'
                                        ? 'text-blue-200 hover:text-white'
                                        : 'text-gray-200 hover:text-white';
                                const iconClasses = isActive
                                    ? variant === 'primary'
                                        ? 'text-blue-200'
                                        : 'text-white'
                                    : variant === 'primary'
                                        ? 'text-blue-200/80'
                                        : 'text-gray-300';

                                const highlightActive =
                                    variant === 'primary'
                                        ? 'after:bg-blue-400 after:opacity-100'
                                        : 'after:bg-white/80 after:opacity-100';
                                const highlightInactive =
                                    variant === 'primary'
                                        ? 'after:bg-blue-400 after:opacity-0 hover:after:opacity-70'
                                        : 'after:bg-white/60 after:opacity-0 hover:after:opacity-60';

                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={closeMobileMenu}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`relative flex h-12 items-center gap-2 rounded-2xl px-4 transition-colors after:pointer-events-none after:absolute after:left-4 after:right-4 after:-bottom-1 after:h-0.5 after:rounded-full after:content-[''] after:transition-opacity ${
                                            isActive
                                                ? `${itemClasses} ${highlightActive}`
                                                : `${itemClasses} ${highlightInactive}`
                                        }`}
                                    >
                                        <span
                                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${iconClasses}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="text-sm font-semibold leading-tight text-left">{label}</span>
                                    </Link>
                                );
                            })}

                            <Link
                                href="/portfolio"
                                onClick={closeMobileMenu}
                                aria-current={portfolioActive ? 'page' : undefined}
                                className={`relative flex h-12 items-center gap-2 rounded-2xl px-4 transition after:pointer-events-none after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:rounded-full after:content-[''] after:transition-opacity ${
                                    portfolioActive
                                        ? 'text-white after:bg-white/80 after:opacity-100'
                                        : 'text-white/80 hover:text-white after:bg-white/60 after:opacity-0 hover:after:opacity-60'
                                }`}
                            >
                                <UserAvatar
                                    name={session?.user?.name}
                                    email={session?.user?.email}
                                    image={session?.user?.image}
                                />
                                <span className="text-sm font-semibold leading-tight text-white">{displayName}</span>
                            </Link>
                        </nav>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

export default Header;