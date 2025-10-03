
import React from 'react';
import type { PricingPlan } from '../types';

interface PricingCardProps {
    plan: PricingPlan;
    isActive: boolean;
    onClick: () => void;
}

const CheckIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PricingCard: React.FC<PricingCardProps> = ({ plan, isActive, onClick }) => {
    const cardClasses = `border-2 p-6 rounded-xl shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer
        ${isActive || plan.highlight ? 'bg-secondary border-accent scale-105' : 'bg-gray-800 border-gray-700 hover:border-primary'}`;

    return (
        <div className={cardClasses} onClick={onClick}>
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            <div className="my-4">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.priceDetails}</span>
            </div>
            <ul className="space-y-3 text-gray-300 flex-grow">
                {plan.features.map(feature => (
                    <li key={feature.name} className="flex items-center group relative">
                        {feature.included ? <CheckIcon className="h-5 w-5 text-accent mr-2 flex-shrink-0" /> : <XIcon className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />}
                        <span>{feature.name}</span>
                        {feature.tooltip && (
                            <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-900 text-white text-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
                                {feature.tooltip}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            <button className={`w-full mt-6 py-3 font-bold rounded-lg transition-colors duration-300
                ${plan.highlight ? 'bg-accent text-white hover:bg-green-600' : 'bg-primary text-white hover:bg-blue-600'}`}>
                {plan.cta}
            </button>
        </div>
    );
};

export default PricingCard;
