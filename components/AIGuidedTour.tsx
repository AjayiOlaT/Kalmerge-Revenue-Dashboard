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
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({ opacity: 0 });
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
                const margin = 15; // Space from viewport edges and target element

                // --- Vertical Placement Logic ---
                let popoverTop = rect.bottom + margin; // Preferred position: below
                let transformOriginY = 'top';

                // If it doesn't fit below, try placing it above.
                if (popoverTop + popoverHeight > viewportHeight - margin) {
                    popoverTop = rect.top - popoverHeight - margin;
                    transformOriginY = 'bottom';
                }
                
                // As a final fallback, clamp it to be within the viewport.
                if (popoverTop < margin) {
                    popoverTop = margin;
                }
                 if (popoverTop + popoverHeight > viewportHeight - margin) {
                    popoverTop = viewportHeight - popoverHeight - margin;
                }

                // --- Horizontal Placement Logic ---
                let popoverLeft = rect.left + rect.width / 2 - popoverWidth / 2;
                
                // Clamp to stay within viewport.
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
            // Hide popover immediately before calculations
            setPopoverStyle(prev => ({ ...prev, opacity: 0, transform: 'scale(0.95)' }));
            
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            
            const timer = setTimeout(updatePositions, 350);
            window.addEventListener('resize', updatePositions);
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updatePositions);
            };
        }
    }, [step.elementId]);
    
    return (
        <div className="fixed inset-0 z-50">
            <div style={highlightStyle}></div>
            <div
                ref={popoverRef}
                style={{
                    position: 'absolute',
                    zIndex: 1001,
                    transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
                    ...popoverStyle
                }}
                className="w-80 max-w-[90vw] bg-white rounded-lg shadow-2xl p-5"
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