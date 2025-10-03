import React from 'react';
import KalmergeLogo from './KalmergeLogo';
import DownloadControl, { DownloadOption } from './DownloadControl';

interface HeaderProps {
    onStartTour: () => void;
    downloadOptions: DownloadOption[];
}

const Header: React.FC<HeaderProps> = ({ onStartTour, downloadOptions }) => {
    return (
        <header id="header" className="bg-white py-4 px-4 sm:px-6 lg:px-8 shadow-sm relative z-[60]">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center">
                    <KalmergeLogo />
                    <h1 className="hidden md:block text-xl md:text-2xl font-semibold text-dark ml-4">
                        Revenue Growth Strategy
                    </h1>
                </div>
                <div className="flex items-center space-x-2">
                    <DownloadControl label="Download Report" options={downloadOptions} />
                    <button 
                        onClick={onStartTour} 
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Start Guided Tour"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;