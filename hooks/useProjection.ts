import { useMemo } from 'react';
import type { Assumptions, ProjectionDataPoint, EditablePrices } from '../types';

export function useProjection(assumptions: Assumptions, prices: EditablePrices) {
    const projectionData = useMemo(() => {
        const data: ProjectionDataPoint[] = [];
        let basicCustomers = 0;
        let proCustomers = 0;
        let entCustomers = 0;

        for (let month = 1; month <= 36; month++) {
            // Churn
            const churnedBasic = basicCustomers * (assumptions.monthlyChurnRate / 100);
            const churnedPro = proCustomers * (assumptions.monthlyChurnRate / 100);
            const churnedEnt = entCustomers * (assumptions.monthlyChurnRate / 100);
            const totalChurned = churnedBasic + churnedPro + churnedEnt;

            basicCustomers -= churnedBasic;
            proCustomers -= churnedPro;
            entCustomers -= churnedEnt;

            // Upsell from Basic to Pro
            const upsoldCustomers = basicCustomers * (assumptions.upsellRate / 100);
            basicCustomers -= upsoldCustomers;
            proCustomers += upsoldCustomers;

            // New Customers
            const convertedFromFree = assumptions.newFreeSignups * (assumptions.freeToPaidConversion / 100);
            const totalNewPaidSignups = convertedFromFree + assumptions.newDirectPaid;

            const planConversionTotal = assumptions.basicPlanConversion + assumptions.professionalPlanConversion + assumptions.enterprisePlanConversion;
            const safePlanConversionTotal = planConversionTotal === 0 ? 1 : planConversionTotal;

            const newBasic = totalNewPaidSignups * (assumptions.basicPlanConversion / safePlanConversionTotal);
            const newPro = totalNewPaidSignups * (assumptions.professionalPlanConversion / safePlanConversionTotal);
            const newEnt = totalNewPaidSignups * (assumptions.enterprisePlanConversion / safePlanConversionTotal);

            basicCustomers += newBasic;
            proCustomers += newPro;
            entCustomers += newEnt;

            // Calculate MRR
            const basicMRR = basicCustomers * assumptions.basicAvgUsers * prices.basic;
            const proMRR = proCustomers * assumptions.proAvgUsers * prices.professional;
            const entMRR = entCustomers * assumptions.enterpriseAvgMRR;
            const totalMRR = basicMRR + proMRR + entMRR;
            
            const totalCustomers = basicCustomers + proCustomers + entCustomers;

            data.push({
                month,
                mrr: Math.round(totalMRR),
                totalCustomers: Math.round(totalCustomers),
                newCustomers: Math.round(totalNewPaidSignups),
                churnedCustomers: Math.round(totalChurned),
                basicCustomers: Math.round(basicCustomers),
                proCustomers: Math.round(proCustomers),
                entCustomers: Math.round(entCustomers),
                basicMRR: Math.round(basicMRR),
                proMRR: Math.round(proMRR),
                entMRR: Math.round(entMRR),
            });
        }
        return data;
    }, [assumptions, prices]);
    
    const monthlyMetrics = useMemo(() => {
        const lastMonth = projectionData[projectionData.length - 1];
        if (!lastMonth) {
            return { totalMRR: 0, totalCustomers: 0 };
        }
        return {
            totalMRR: lastMonth.mrr,
            totalCustomers: lastMonth.totalCustomers,
        };
    }, [projectionData]);

    return { projectionData, monthlyMetrics };
}