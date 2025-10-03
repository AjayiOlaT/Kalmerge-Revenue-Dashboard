import React from 'react';

const KalmergeLogo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10 8C10 6.89543 10.8954 6 12 6H36C37.1046 6 38 6.89543 38 8V12H10V8Z" fill="#A78BFA"/>
                <path d="M10 12V40C10 41.1046 10.8954 42 12 42H36C37.1046 42 38 41.1046 38 40V12H10Z" fill="#6D28D9"/>
                <path d="M16 4C16 2.89543 16.8954 2 18 2C19.1046 2 20 2.89543 20 4V10C20 11.1046 19.1046 12 18 12C16.8954 12 16 11.1046 16 10V4Z" fill="#A78BFA"/>
                <path d="M28 4C28 2.89543 28.8954 2 30 2C31.1046 2 32 2.89543 32 4V10C32 11.1046 31.1046 12 30 12C28.8954 12 28 11.1046 28 10V4Z" fill="#A78BFA"/>
                <path d="M20 20V34H22V28L28 34V20L22 26V20H20Z" fill="white"/>
            </svg>
            <span className="text-2xl font-bold text-slate-800">KalMerge</span>
        </div>
    );
};

export default KalmergeLogo;
