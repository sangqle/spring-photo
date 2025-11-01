import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Upload, Users, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { auth } from '@/auth';

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect('/feed');
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-600 via-purple-600 to-pink-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Share Your Photography<br />With The World
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of photographers sharing their portfolios, connecting with clients, and building their community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100">
              Get Started
            </Link>
            <Link
              href="/feed"
              className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Explore Photos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything You Need to Showcase Your Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-card-darker p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Easy Upload</h3>
              <p className="text-gray-400">
                Upload and organize your photos with our simple drag-and-drop interface.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card-darker p-6 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Beautiful Portfolios</h3>
              <p className="text-gray-400">
                Create stunning portfolios to showcase your best work to potential clients.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card-darker p-6 rounded-lg border border-gray-800 hover:border-pink-500 transition-colors">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-400">
                Connect with other photographers and grow your network.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card-darker p-6 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Client Sharing</h3>
              <p className="text-gray-400">
                Share private galleries with your clients and get instant feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Share Your Vision?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join our community of photographers today and start building your portfolio.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </>
  );
}