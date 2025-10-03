import React, { useState, useLayoutEffect, useRef } from 'react';
import type { TourStep } from '../types';

interface AIGuidedTourProps {
    steps: TourStep[];
    currentStep: number;
    onNext: () => void;
    onPrev: () => void;
    onFinish: () => void;
}

const AIGuidedTour: React.FC<AIGuidedTourProps> = ({ steps, currentStep, onNext, onPrev, onFinish }) => {
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0, transform: 'scale(0.95)' });
    const popoverRef = useRef<HTMLDivElement>(null);

    const step = steps[currentStep];

    useLayoutEffect(() => {
        const targetElement = document.getElementById(step.elementId);

        const updatePositions = () => {
            if (targetElement && popoverRef.current) {
                const rect = targetElement.getBoundingClientRect();
                const popoverEl = popoverRef.current;
                const popoverWidth = popoverEl.offsetWidth;
                const popoverHeight = popoverEl.offsetHeight;

                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const margin = 15;

                let popoverTop = rect.bottom + margin;
                let transformOriginY = 'top';

                if (popoverTop + popoverHeight > viewportHeight - margin) {
                    popoverTop = rect.top - popoverHeight - margin;
                    transformOriginY = 'bottom';
                }
                
                if (popoverTop < margin) {
                    popoverTop = margin;
                }
                 if (popoverTop + popoverHeight > viewportHeight - margin) {
                    popoverTop = viewportHeight - popoverHeight - margin;
                }

                let popoverLeft = rect.left + rect.width / 2 - popoverWidth / 2;
                
                popoverLeft = Math.max(margin, popoverLeft);
                popoverLeft = Math.min(popoverLeft, viewportWidth - popoverWidth - margin);
                
                setPopoverStyle({
                    opacity: 1,
                    top: `${popoverTop}px`,
                    left: `${popoverLeft}px`,
                    transform: 'scale(1)',
                    transformOrigin: `${transformOriginY} center`,
                });
            }
        };

        if (targetElement) {
            setPopoverStyle(prev => ({ ...prev, opacity: 0, transform: 'scale(0.95)' }));
            
            const elementToScrollTo = targetElement.closest('section') || targetElement;
            const navbar = document.getElementById('main-nav');
            const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
            const elementRect = elementToScrollTo.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.scrollY;
            const offset = navbarHeight + 20; // 20px padding
            
            window.scrollTo({
                top: absoluteElementTop - offset,
                behavior: 'smooth'
            });

            const timer = setTimeout(updatePositions, 350);
            window.addEventListener('resize', updatePositions);
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updatePositions);
            };
        }
    }, [step.elementId]);
    
    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Removed the background overlay for AI tour to simplify it */}
            <div
                ref={popoverRef}
                style={{
                    position: 'absolute',
                    zIndex: 1001,
                    transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
                    ...popoverStyle
                }}
                className="w-80 max-w-[90vw] bg-white rounded-lg shadow-2xl p-5 pointer-events-auto"
            >
                <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-gray-700 mb-4">{step.description}</p>
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {currentStep + 1} / {steps.length}
                    </div>
                    <div className="flex items-center">
                        <button 
                            onClick={onFinish} 
                            className="text-sm text-gray-500 hover:text-primary transition-colors mr-4"
                        >
                            Skip
                        </button>
                        {currentStep > 0 && (
                            <button onClick={onPrev} className="text-sm font-semibold text-gray-600 hover:text-primary px-3 py-1 mr-2 rounded-md hover:bg-gray-100 transition-colors">
                                Previous
                            </button>
                        )}
                        {currentStep < steps.length - 1 ? (
                            <button onClick={onNext} className="bg-primary text-white font-bold py-1 px-4 rounded-lg text-sm hover:bg-violet-700 transition-colors">
                                Next
                            </button>
                        ) : (
                            <button onClick={onFinish} className="bg-secondary text-white font-bold py-1 px-4 rounded-lg text-sm hover:bg-violet-600 transition-colors">
                                Finish
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIGuidedTour;