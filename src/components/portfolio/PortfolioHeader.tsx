import React from 'react';

const PortfolioHeader: React.FC<{ userName: string; userBio: string }> = ({ userName, userBio }) => {
    return (
        <header className="portfolio-header">
            <h1 className="text-3xl font-bold">{userName}'s Portfolio</h1>
            <p className="text-lg text-gray-600">{userBio}</p>
        </header>
    );
};

export default PortfolioHeader;