'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Camera, Compass, Menu, Search, Upload, User, X } from 'lucide-react';

type NavItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    variant: 'neutral' | 'primary';
};

const navItems: NavItem[] = [
    {
        href: '/portfolio',
        label: 'You',
        icon: User,
        variant: 'neutral',
    },
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
      variant: 'neutral',
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
    className,
}: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    className?: string;
}) => {
    const fallback = (name ?? email ?? '?').charAt(0).toUpperCase();

    const baseClasses = 'flex items-center justify-center overflow-hidden rounded-full bg-card';
    const sizeClasses = className && className.trim().length > 0 ? className : 'h-9 w-9';

    if (image) {
        return (
            <span className={`${baseClasses} ${sizeClasses}`}>
                <img src={image} alt={name ?? email ?? 'User avatar'} className="h-full w-full object-cover" />
            </span>
        );
    }

    return (
        <span className={`${baseClasses} ${sizeClasses} text-sm font-semibold text-white`}>
            {fallback}
        </span>
    );
};

const Header: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const userMenuRef = useRef<HTMLDivElement | null>(null);

    const toggleMobileMenu = () => {
        setUserMenuOpen(false);
        setMobileMenuOpen((open) => !open);
    };
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    };
    const toggleUserMenu = () => setUserMenuOpen((open) => !open);
    const closeUserMenu = () => setUserMenuOpen(false);

    useEffect(() => {
        const handleClickAway = (event: MouseEvent) => {
            if (!userMenuRef.current) {
                return;
            }
            if (!userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickAway);
        return () => {
            document.removeEventListener('mousedown', handleClickAway);
        };
    }, []);

    useEffect(() => {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
    }, [pathname]);

    const displayName = session?.user?.name ?? session?.user?.email ?? 'Your space';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-800 bg-card-darker/95 shadow-lg shadow-black/10 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 w-full items-center gap-4">
                    <div className="flex flex-1 items-center gap-4">
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
                    </div>

                    <nav className="hidden items-center gap-0.5 md:flex">
                        {navItems.map(({ href, label, icon: Icon, variant }) => {
                            const isActive = pathname?.startsWith(href);
                            const baseStyles =
                                "group relative flex h-12 items-center rounded-2xl px-2 transition-colors after:pointer-events-none after:absolute after:left-4 after:right-4 after:-bottom-1 after:h-0.5 after:rounded-full after:content-[''] after:transition-opacity";
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

                        {session ? (
                            <div ref={userMenuRef} className="relative">
                                <button
                                    type="button"
                                    onClick={toggleUserMenu}
                                    aria-label="Open user menu"
                                    aria-haspopup="true"
                                    aria-expanded={userMenuOpen}
                                    className={`group relative flex h-12 items-center px-2 transition-colors after:pointer-events-none after:absolute after:left-2 after:right-2 after:-bottom-1 after:h-0.5 after:rounded-full after:transition-opacity focus:outline-none focus:ring-offset-transparent ${
                                        userMenuOpen
                                            ? 'text-white after:bg-white/80 after:opacity-100'
                                            : 'text-gray-200 hover:text-white after:bg-white/60 after:opacity-0 hover:after:opacity-60'
                                    }`}
                                >
                                    <UserAvatar
                                        name={session.user?.name}
                                        email={session.user?.email}
                                        image={session.user?.image as string | null}
                                        className="h-9 w-9"
                                    />
                                </button>

                                {userMenuOpen ? (
                                    <div className="absolute right-0 mt-3 w-64 overflow-hidden bg-card shadow-xl shadow-black/30">
                                        <div className="border-b border-white/5 px-4 py-3">
                                            <p className="text-sm font-semibold text-white">{displayName}</p>
                                            {session.user?.email ? (
                                                <p className="text-xs text-gray-400">{session.user.email}</p>
                                            ) : null}
                                        </div>
                                        <nav className="flex flex-col gap-1 px-2 py-2 text-sm font-medium text-gray-200">
                                            <Link
                                                href="/settings"
                                                onClick={closeUserMenu}
                                                className="rounded-xl px-3 py-2 transition hover:bg-white/10"
                                            >
                                                Profile settings
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    closeUserMenu();
                                                    void signOut({ callbackUrl: '/' });
                                                }}
                                                className="mt-1 inline-flex items-center justify-start rounded-xl px-3 py-2 text-left text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                                            >
                                                Sign out
                                            </button>
                                        </nav>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={closeUserMenu}
                                className="group relative flex h-12 items-center rounded-2xl px-4 text-blue-200 transition-colors after:pointer-events-none after:absolute after:left-4 after:right-4 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-blue-400 after:opacity-0 after:transition-opacity hover:text-white hover:after:opacity-70"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-blue-200/80 transition-colors group-hover:text-blue-200">
                                    <User className="h-5 w-5" />
                                </span>
                                <span className="text-sm font-semibold leading-tight text-left">Sign in</span>
                            </Link>
                        )}
                    </nav>

                    <button
                        type="button"
                        onClick={toggleMobileMenu}
                        className="text-white md:hidden"
                        aria-label="Toggle navigation"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                    </button>
                </div>

                {mobileMenuOpen ? (
                    <div className="space-y-4 border-t border-gray-800 py-4 md:hidden">
                        <SearchBar placeholder="Search photos..." />

                        {session ? (
                            <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        name={session.user?.name}
                                        email={session.user?.email}
                                        image={session.user?.image as string | null}
                                        className="h-12 w-12"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-white">{displayName}</p>
                                        {session.user?.email ? (
                                            <p className="text-xs text-gray-400">{session.user.email}</p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-2 text-sm font-medium">
                                    <Link
                                        href="/portfolio"
                                        onClick={closeMobileMenu}
                                        className="rounded-xl border border-white/5 px-3 py-2 text-left text-gray-200 transition hover:border-white/10 hover:bg-white/10"
                                    >
                                        Your portfolio
                                    </Link>
                                    <Link
                                        href="/settings"
                                        onClick={closeMobileMenu}
                                        className="rounded-xl border border-white/5 px-3 py-2 text-left text-gray-200 transition hover:border-white/10 hover:bg-white/10"
                                    >
                                        Profile settings
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            closeMobileMenu();
                                            void signOut({ callbackUrl: '/' });
                                        }}
                                        className="rounded-xl border border-red-500/40 px-3 py-2 text-left font-semibold text-red-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-200"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                onClick={closeMobileMenu}
                                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                            >
                                Sign in
                            </Link>
                        )}

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
                        </nav>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

export default Header;