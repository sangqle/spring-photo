'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Upload, User, Menu, X, Camera } from 'lucide-react';

type NavItem = {
    href: string;
    label: string;
    icon?: React.ElementType;
};

const navItems: NavItem[] = [
    { href: '/feed', label: 'Explore' },
    { href: '/upload', label: 'Upload', icon: Upload },
    { href: '/portfolio', label: 'You', icon: User },
];

const inputStyles =
    'w-full bg-card text-white placeholder-gray-400 px-4 py-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

const SearchBar = ({
    placeholder,
    className = '',
}: {
    placeholder: string;
    className?: string;
}) => (
    <div className={['relative', className].filter(Boolean).join(' ')}>
        <input type="text" placeholder={placeholder} className={inputStyles} />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
    </div>
);

const Header: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-card-darker border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                    >
                        <Camera className="w-8 h-8" />
                        <span className="hidden sm:block text-xl font-semibold">PhotoShare</span>
                    </Link>

                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <SearchBar placeholder="Search photos, people, or groups" className="w-full" />
                    </div>

                    <nav className="hidden md:flex items-center gap-2 text-sm">
                        {navItems.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center text-gray-200 hover:text-white transition-colors"
                            >
                                {Icon ? <Icon className="w-5 h-5" /> : null}
                                <span>{label}</span>
                            </Link>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={toggleMobileMenu}
                        className="md:hidden text-white p-2"
                        aria-label="Toggle navigation"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-800 py-4 space-y-4">
                        <SearchBar placeholder="Search photos..." />
                        <nav className="flex flex-col space-y-3">
                            {navItems.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={closeMobileMenu}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                                >
                                    {Icon ? <Icon className="w-5 h-5" /> : null}
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;