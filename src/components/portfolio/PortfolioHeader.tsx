import React from 'react';

interface PortfolioHeaderProps {
    userName?: string;
    userBio?: string;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ userName, userBio }) => {
    const title = userName ? `${userName}'s Portfolio` : 'Your Portfolio';
    const bio = userBio ?? 'Showcase the shots you are most proud of and build your story.';

    return (
        <header className="space-y-3 py-12 text-center">
            <h1 className="text-4xl font-bold text-white">{title}</h1>
            <p className="text-base text-gray-400">{bio}</p>
        </header>
    );
};

export default PortfolioHeader;