import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { Assumptions, ProjectionDataPoint, TourStep } from '../types';

export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    let ai: GoogleGenAI | null = null;
    const getAI = () => {
        if (!ai) {
            ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        }
        return ai;
    };

    const generateExplanation = async (assumptions: Assumptions, projectionData: ProjectionDataPoint[]): Promise<TourStep[] | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const genAI = getAI();
            const lastMonth = projectionData[projectionData.length - 1];
            const averageChurned = Math.round(projectionData.reduce((acc, p) => acc + p.churnedCustomers, 0) / projectionData.length);

            const prompt = `
            You are an expert financial analyst. Your task is to analyze a financial projection for a SaaS company named Kalmerge and create a 5-step guided tour to explain the results. The tour must tell a clear, insightful story about the projection, following the narrative structure below.

            **Current Assumptions:**
            - New Free Signups per Month: ${assumptions.newFreeSignups}
            - Free-to-Paid Conversion Rate: ${assumptions.freeToPaidConversion}%
            - Monthly Churn Rate: ${assumptions.monthlyChurnRate}%
            - Upsell Rate (Basic to Pro): ${assumptions.upsellRate}%
            - Plan Distribution: ${assumptions.basicPlanConversion}% Basic, ${assumptions.professionalPlanConversion}% Pro, ${assumptions.enterprisePlanConversion}% Enterprise

            **36-Month Projection Summary:**
            - Final MRR: $${lastMonth.mrr.toLocaleString()}
            - Final Total Customers: ${lastMonth.totalCustomers}
            - Average Churned Customers per month: ${averageChurned}

            **Required Narrative Structure (5 Steps):**

            1.  **The Big Picture:** Start with a high-level summary of the MRR growth. For example, "Based on your assumptions, you're on track to reach $${lastMonth.mrr.toLocaleString()} MRR in 36 months...".
                - Highlight elementId: "charts-container".
                - Use a preAction to ensure the chart is 'line': \`{ "type": "switch_chart", "payload": "line" }\`.

            2.  **Key Growth Drivers:** Identify and highlight the primary factors driving this growth from the assumptions. For example, "This growth is mainly fueled by acquiring new customers each month...".
                - Highlight elementId: "assumptions-grid".

            3.  **Revenue Composition:** Analyze where the revenue comes from. For example, "As you scale, the Professional Plan is projected to become your largest source of revenue."
                - Highlight elementId: "charts-container".
                - **Crucially, you MUST use a preAction to switch to the 'area' chart:** \`{ "type": "switch_chart", "payload": "area" }\`.

            4.  **Potential Headwinds:** Point out challenges, focusing on customer churn. Use the average churn number provided. For example, "A key factor to monitor is your churn rate. At ${assumptions.monthlyChurnRate}%, you're projected to lose an average of ${averageChurned} customers per month...".
                - Highlight elementId: "charts-container".
                - **Crucially, you MUST use a preAction to switch to the 'bar' chart:** \`{ "type": "switch_chart", "payload": "bar" }\`.

            5.  **Concluding Insights:** Provide a final key takeaway, highlighting the CLTV or KPIs. For example, "Overall, this is a strong projection. To accelerate growth further, focusing on reducing churn...".
                - Highlight elementId: "cltv-card".

            **Output Format:**
            Your response must be ONLY the JSON array of 5 tour steps. Each step must have:
            1.  "elementId": The ID of the HTML element to highlight (string).
            2.  "title": A short, engaging title for the tour step (string).
            3.  "description": A concise explanation (1-3 sentences) based on the narrative point (string).
            4.  "preAction" (optional): An action to perform before showing the step. Only use it as instructed.
            `;
            
            const responseSchema = {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    elementId: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    preAction: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            payload: { type: Type.STRING },
                        },
                        nullable: true,
                    }
                  },
                  required: ["elementId", "title", "description"]
                }
            };

            const response = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });
            
            const jsonText = response.text.trim();
            const parsedData: TourStep[] = JSON.parse(jsonText);
            
            setIsLoading(false);
            return parsedData;

        } catch (e: any) {
            console.error("Error generating AI explanation:", e);
            setError(`Failed to generate explanation. Please check your API key and try again.`);
            setIsLoading(false);
            return null;
        }
    };

    return { generateExplanation, isLoading, error };
}