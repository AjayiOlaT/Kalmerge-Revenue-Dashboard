import React from 'react';

interface AnimationSpotlightProps {
    targetRect: DOMRect;
}

const AnimationSpotlight: React.FC<AnimationSpotlightProps> = ({ targetRect }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        top: `${targetRect.top - 6}px`,
        left: `${targetRect.left - 6}px`,
        width: `${targetRect.width + 12}px`,
        height: `${targetRect.height + 12}px`,
        border: '2px solid #A78BFA', // accent color
        borderRadius: '8px',
        boxShadow: '0 0 15px 5px rgba(167, 139, 250, 0.7)',
        animation: 'pulse-glow 2s ease-in-out infinite',
        zIndex: 1001,
        pointerEvents: 'none',
        transition: 'all 0.3s ease-in-out',
    };

    const keyframes = `
        @keyframes pulse-glow {
            0%, 100% {
                box-shadow: 0 0 15px 5px rgba(167, 139, 250, 0.6);
                transform: scale(1);
            }
            50% {
                box-shadow: 0 0 25px 10px rgba(167, 139, 250, 0.8);
                transform: scale(1.05);
            }
        }
    `;

    return (
        <>
            <style>{keyframes}</style>
            <div style={style}></div>
        </>
    );
};

export default AnimationSpotlight;
