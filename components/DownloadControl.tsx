import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon } from './icons';

// FIX: The overload error on React.cloneElement is resolved by specifically typing the `icon` prop
// in the `DownloadOption` interface as `React.ReactElement<{ className?: string }>`.
// This allows TypeScript to correctly infer the props of the icon component, enabling `className` to be passed.
export interface DownloadOption {
    label: string;
    icon: React.ReactElement<{ className?: string }>;
    action: () => void;
}

interface DownloadControlProps {
    label: string;
    options: DownloadOption[];
}

const DownloadControl: React.FC<DownloadControlProps> = ({ label, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleOptionClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <div>
                <button
                    type="button"
                    className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-primary"
                    id="menu-button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <DownloadIcon className="mr-2 h-5 w-5" />
                    {label}
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option.action)}
                                className="text-gray-700 group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                            >
                                {React.cloneElement(option.icon, { className: 'mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500' })}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DownloadControl;