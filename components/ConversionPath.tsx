import React, { useState } from 'react';
import { CONVERSION_PATH_STEPS } from '../constants';
import MagnifyingGlassIcon from './MagnifyingGlassIcon';
import LightbulbIcon from './LightbulbIcon';
import DollarSignIcon from './DollarSignIcon';
import RocketIcon from './RocketIcon';

const icons = {
    'Discovery (Free)': <MagnifyingGlassIcon />,
    'Triggering Upgrade Needs': <LightbulbIcon />,
    'Conversion': <DollarSignIcon />,
    'Onboarding to Paid': <RocketIcon />,
};

const ConversionPath: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="w-full">
            {/* Step Indicators */}
            <div className="flex flex-col md:flex-row justify-between items-stretch">
                {CONVERSION_PATH_STEPS.map((step, index) => (
                    <React.Fragment key={index}>
                        <div 
                            className="flex flex-row md:flex-col items-center text-center cursor-pointer group w-full md:w-auto p-2"
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Select step ${index + 1}: ${step.title}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setActiveIndex(index)}
                        >
                            <div className={`
                                w-16 h-16 md:w-20 md:h-20 rounded-full flex-shrink-0 flex items-center justify-center text-white transition-all duration-300 transform 
                                ${activeIndex === index ? 'bg-primary scale-110 shadow-lg' : 'bg-secondary group-hover:bg-primary group-hover:scale-105'}
                            `}>
                                {React.cloneElement(icons[step.title as keyof typeof icons], { className: 'w-8 h-8 md:w-10 md:h-10' })}
                            </div>
                            <h3 className={`md:mt-3 ml-4 md:ml-0 font-semibold text-left md:text-center text-lg transition-colors ${activeIndex === index ? 'text-primary' : 'text-dark'}`}>
                                {step.title}
                            </h3>
                        </div>

                        {index < CONVERSION_PATH_STEPS.length - 1 && (
                            <>
                                <div className="hidden md:block flex-grow border-t-2 border-dashed border-gray-300 self-center mx-4"></div>
                                <div className="md:hidden h-8 w-px border-l-2 border-dashed border-gray-300 my-2 ml-10"></div>
                            </>
                        )}
                    </React.Fragment>
                ))}
            </div>
            
            {/* Content Box */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200 min-h-[120px] transition-all duration-300">
                <p className="text-lg text-gray-700 leading-relaxed">
                    {CONVERSION_PATH_STEPS[activeIndex].description}
                </p>
            </div>
        </div>
    );
};

export default ConversionPath;
