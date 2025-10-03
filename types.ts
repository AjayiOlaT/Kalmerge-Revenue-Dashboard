export interface Assumptions {
  newFreeSignups: number;
  freeToPaidConversion: number;
  newDirectPaid: number;
  basicPlanConversion: number;
  professionalPlanConversion: number;
  enterprisePlanConversion: number;
  basicAvgUsers: number;
  proAvgUsers: number;
  enterpriseAvgMRR: number;
  monthlyChurnRate: number;
  upsellRate: number;
}

export interface ProjectionDataPoint {
  month: number;
  mrr: number;
  totalCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  basicCustomers: number;
  proCustomers: number;
  entCustomers: number;
  basicMRR: number;
  proMRR: number;
  entMRR: number;
}

export interface MonthlyMetrics {
  totalMRR: number;
  totalCustomers: number;
}

export interface TourStep {
  elementId: string;
  title: string;
  description: string;
  // For AI Tour
  preAction?: {
    type: 'switch_chart';
    payload: 'line' | 'area' | 'bar' | 'pie';
  };
  // For Onboarding Tour
  hasAnimation?: 'click';
  animationTargetId?: string;
}

export interface EditablePrices {
    basic: number;
    professional: number;
}

// FIX: Add missing PricingPlan interface, which was causing an error in components/PricingCard.tsx
export interface PricingPlan {
    name: string;
    price: string;
    priceDetails: string;
    features: {
        name: string;
        included: boolean;
        tooltip?: string;
    }[];
    highlight?: boolean;
    cta: string;
}
