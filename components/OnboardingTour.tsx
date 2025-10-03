import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import type { TourStep } from '../types';
import ClickAnimator from './ClickAnimator';
import AnimationSpotlight from './AnimationSpotlight';

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
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0, transform: 'scale(0.95)' });
    const [animationRect, setAnimationRect] = useState<DOMRect | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const step = steps[currentStep];

    useLayoutEffect(() => {
        setHighlightStyle(prev => ({ ...prev, opacity: 0 }));
        setAnimationRect(null);

        const targetElement = document.getElementById(step.elementId);

        const updatePositions = () => {
            if (targetElement && popoverRef.current) {
                const rect = targetElement.getBoundingClientRect();
                const padding = 10;

                setHighlightStyle({
                    position: 'absolute',
                    opacity: 1,
                    top: `${rect.top - padding}px`,
                    left: `${rect.left - padding}px`,
                    width: `${rect.width + padding * 2}px`,
                    height: `${rect.height + padding * 2}px`,
                    boxShadow: step.hasAnimation ? '0 0 0 9999px rgba(15, 23, 42, 0.85)' : '0 0 0 9999px rgba(15, 23, 42, 0.75)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease-in-out, opacity 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    zIndex: 1000,
                    pointerEvents: 'none',
                });
                
                const popoverEl = popoverRef.current;
                const popoverWidth = popoverEl.offsetWidth;
                const popoverHeight = popoverEl.offsetHeight;

                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const margin = 15;

                if (step.hasAnimation) {
                    let popoverLeft = viewportWidth / 2 - popoverWidth / 2;
                    let popoverTop = viewportHeight - popoverHeight - margin * 2;

                    setPopoverStyle({
                        opacity: 1,
                        top: `${popoverTop}px`,
                        left: `${popoverLeft}px`,
                        transform: 'scale(1)',
                        transformOrigin: `bottom center`,
                    });
                } else {
                    let popoverTop = rect.bottom + margin;
                    let transformOriginY = 'top';

                    if (popoverTop + popoverHeight > viewportHeight - margin) {
                        popoverTop = rect.top - popoverHeight - margin;
                        transformOriginY = 'bottom';
                    }
                    
                    if (popoverTop < margin) popoverTop = margin;
                    if (popoverTop + popoverHeight > viewportHeight - margin) popoverTop = viewportHeight - popoverHeight - margin;
                    
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
            setPopoverStyle(prev => ({ ...prev, opacity: 0, transform: 'scale(0.95)' }));
            
            const elementToScrollTo = targetElement.closest('section') || targetElement;
            const navbar = document.getElementById('main-nav');
            const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
            const elementRect = elementToScrollTo.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.scrollY;
            
            const isHeader = step.elementId === 'header';
            const offset = isHeader ? 0 : navbarHeight + 20;
            
            window.scrollTo({
                top: isHeader ? 0 : absoluteElementTop - offset,
                behavior: 'smooth'
            });
            
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
            {animationRect && <AnimationSpotlight targetRect={animationRect} />}
            <div style={highlightStyle}></div>
            <div
                ref={popoverRef}
                style={{
                    position: 'absolute',
                    zIndex: 1003,
                    transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out, top 0.3s ease-in-out, left 0.3s ease-in-out',
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