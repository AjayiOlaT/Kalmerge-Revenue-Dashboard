import { useState } from 'react';
import type { Assumptions, ProjectionDataPoint, TourStep } from '../types';

export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const generateExplanation = async (assumptions: Assumptions, projectionData: ProjectionDataPoint[]): Promise<TourStep[] | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/.netlify/functions/generate-explanation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ assumptions, projectionData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }

            const parsedData: TourStep[] = await response.json();
            
            setIsLoading(false);
            return parsedData;

        } catch (e: any) {
            console.error("Error calling Netlify function:", e);
            setError(`An unexpected error occurred. The AI analyst may be unavailable. Please try again later.`);
            setIsLoading(false);
            return null;
        }
    };

    return { generateExplanation, isLoading, error };
}