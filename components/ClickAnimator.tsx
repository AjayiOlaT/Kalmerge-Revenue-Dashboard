import React from 'react';

const MousePointerIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-lg">
    <path 
      d="M5.21 4.24L17.45 16.19L14.31 19.33L13.58 18.6L11.5 20.68L10.79 19.97L12.5 18.26L11.77 17.53L5.21 4.24M19.33 14.31L16.19 17.45L4.24 5.21L7.53 1.77L13.09 7.33L15.17 5.25L15.88 5.96L13.79 8.04L15.5 9.75L16.23 9.02L19.33 12.12V14.31Z" 
      fill="#6D28D9"
      stroke="white"
      strokeWidth="1.5"
    />
  </svg>
);

interface ClickAnimatorProps {
  targetRect: DOMRect;
}

const ClickAnimator: React.FC<ClickAnimatorProps> = ({ targetRect }) => {
    
    // Define keyframes dynamically based on the target element's position
    const animationStyle = `
        @keyframes click-and-move {
            0%, 100% { 
                top: ${targetRect.top + targetRect.height / 2 - 12}px; 
                left: ${targetRect.left + targetRect.width - 20}px; 
                transform: scale(1) rotate(-15deg); 
                opacity: 0; 
            }
            10% { opacity: 1; }
            20% { 
                top: ${targetRect.top + targetRect.height / 2 - 12}px; 
                left: ${targetRect.left + targetRect.width - 20}px; 
                transform: scale(1) rotate(-15deg); 
            }
            25%, 35% { transform: scale(0.8) rotate(-15deg); }
            30% { transform: scale(1) rotate(-15deg); }
            45% { 
                top: ${targetRect.top + targetRect.height / 2 - 12}px; 
                left: ${targetRect.left + targetRect.width - 20}px; 
            }
            55% { 
                top: ${targetRect.top + targetRect.height / 2 - 12}px; 
                left: ${targetRect.left + 10}px; 
            }
            70% { 
                top: ${targetRect.top + targetRect.height / 2 - 12}px; 
                left: ${targetRect.left + 10}px; 
                transform: scale(1) rotate(-15deg); 
            }
            75%, 85% { transform: scale(0.8) rotate(-15deg); }
            80% { transform: scale(1) rotate(-15deg); }
            95% { opacity: 1; }
        }
    `;

    return (
        <>
            <style>{animationStyle}</style>
            <div 
                style={{
                    position: 'absolute',
                    zIndex: 1002,
                    animation: 'click-and-move 5s ease-in-out infinite',
                    pointerEvents: 'none'
                }}
            >
                <MousePointerIcon />
            </div>
        </>
    );
};

export default ClickAnimator;