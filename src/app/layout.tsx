import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'PhotoShare - Share Your Photography Portfolio',
  description: 'A platform for photographers to showcase their work, share with clients, and connect with the community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
  <body className="bg-background text-white">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="grow pt-20 md:pt-24">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}