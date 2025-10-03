import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import type { TourStep } from '../types';
import ClickAnimator from './ClickAnimator';

interface OnboardingTourProps {
    steps: TourStep[];
    currentStep: number;
    onNext: () => void;
    onPrev: () => void;
    onFinish: () => void;
    onAnimateStep: () => () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, currentStep, onNext, onPrev, onFinish, onAnimateStep }) => {
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const [animationRect, setAnimationRect] = useState<DOMRect | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const step = steps[currentStep];

    useLayoutEffect(() => {
        setHighlightStyle(prev => ({ ...prev, opacity: 0 }));
        setPopoverStyle(prev => ({ ...prev, opacity: 0 }));
        setAnimationRect(null);

        const targetElement = document.getElementById(step.elementId);

        const updatePositions = () => {
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const padding = 10;

                setHighlightStyle({
                    position: 'absolute',
                    opacity: 1,
                    top: `${rect.top - padding}px`,
                    left: `${rect.left - padding}px`,
                    width: `${rect.width + padding * 2}px`,
                    height: `${rect.height + padding * 2}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease-in-out, opacity 0.3s ease-in-out',
                    zIndex: 1000,
                    pointerEvents: 'none',
                });

                if (popoverRef.current) {
                    const popoverRect = popoverRef.current.getBoundingClientRect();
                    let popoverTop = rect.bottom + 15;
                    let popoverLeft = rect.left + rect.width / 2 - popoverRect.width / 2;

                    if (popoverTop + popoverRect.height > window.innerHeight) {
                        popoverTop = rect.top - popoverRect.height - 15;
                    }
                    if (popoverLeft + popoverRect.width > window.innerWidth) {
                        popoverLeft = window.innerWidth - popoverRect.width - 15;
                    }
                    if (popoverLeft < 15) {
                        popoverLeft = 15;
                    }

                    setPopoverStyle({
                        opacity: 1,
                        transform: 'translateY(0)',
                        top: `${popoverTop}px`,
                        left: `${popoverLeft}px`,
                    });
                }
                
                if (step.hasAnimation === 'click' && step.animationTargetId) {
                    const animationTarget = document.getElementById(step.animationTargetId);
                    if (animationTarget) {
                        setAnimationRect(animationTarget.getBoundingClientRect());
                    }
                } else {
                    setAnimationRect(null);
                }
            }
        };

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const timer = setTimeout(updatePositions, 350);

            window.addEventListener('resize', updatePositions);
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updatePositions);
            };
        }
    }, [step]);
    
    useEffect(() => {
        let cleanupAnimation: (() => void) | undefined;
        if (step?.hasAnimation === 'click') {
            cleanupAnimation = onAnimateStep();
        }

        return () => {
            if (cleanupAnimation) {
                cleanupAnimation();
            }
        };
    }, [step, onAnimateStep]);
    
    return (
        <div className="fixed inset-0 z-50">
            {animationRect && <ClickAnimator targetRect={animationRect} />}
            <div style={highlightStyle}></div>
            <div
                ref={popoverRef}
                style={{
                    position: 'absolute',
                    zIndex: 1001,
                    opacity: 0,
                    transform: 'translateY(10px)',
                    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out, top 0.3s ease-in-out, left 0.3s ease-in-out',
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

export default OnboardingTour;