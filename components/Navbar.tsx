import React, { useState, useEffect } from 'react';
import { SECTIONS } from '../constants';

const Navbar: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('');

    const handleScroll = () => {
        const scrollPosition = window.scrollY + 150;
        let currentSection = '';
        SECTIONS.forEach(section => {
            const el = document.getElementById(section.id);
            if (el && el.offsetTop <= scrollPosition) {
                currentSection = section.id;
            }
        });
        setActiveSection(currentSection);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav id="main-nav" className="sticky top-0 bg-white/80 backdrop-blur-sm z-50 shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-center h-16">
                     <div className="w-full overflow-x-auto -mx-4 px-4 whitespace-nowrap scrollbar-hide">
                        <div className="flex items-center justify-start sm:justify-center space-x-4">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex-shrink-0 ${
                                        activeSection === section.id
                                            ? 'bg-primary text-white'
                                            : 'text-gray-500 hover:bg-violet-100 hover:text-primary'
                                    }`}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;