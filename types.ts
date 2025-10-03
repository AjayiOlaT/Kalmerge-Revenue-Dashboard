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

export type ChartType = 'line' | 'area' | 'bar' | 'pie';


export interface TourStep {
  elementId: string;
  title: string;
  description: string;
  // For AI Tour
  preAction?: {
    type: 'switch_chart';
    payload: ChartType;
  };
  // For Onboarding Tour
  hasAnimation?: 'click';
  animationTargetId?: string;
}

export interface EditablePrices {
    basic: number;
    professional: number;
}

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

export interface Tier {
    name: string;
    price: string;
    priceDetails: string;
    cta: string;
    highlight?: boolean;
}

export interface Feature {
    name: string;
    values: string[];
}

export interface PricingTableData {
    tiers: Tier[];
    features: Feature[];
}