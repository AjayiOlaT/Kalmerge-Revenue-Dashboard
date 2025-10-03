import type { Assumptions, TourStep, PricingTableData } from './types';

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  newFreeSignups: 1000,
  freeToPaidConversion: 3,
  newDirectPaid: 10,
  basicPlanConversion: 70,
  professionalPlanConversion: 25,
  enterprisePlanConversion: 5,
  basicAvgUsers: 1.5,
  proAvgUsers: 5,
  enterpriseAvgMRR: 500,
  monthlyChurnRate: 5,
  upsellRate: 1,
};

export const SECTIONS = [
    { id: 'summary', title: 'Executive Summary' },
    { id: 'pricing', title: 'Pricing & Feature Tiers' },
    { id: 'conversion', title: 'Free-to-Paid Conversion Path' },
    { id: 'projections', title: 'Financial Projections' },
    { id: 'metrics', title: 'Strategic Growth Metrics' },
    { id: 'vision', title: 'Long-Term Vision' },
];

export const ASSUMPTION_TOOLTIPS = {
  newFreeSignups: 'The estimated number of new users signing up for the free plan each month. This is the top of your acquisition funnel.',
  freeToPaidConversion: 'The percentage of free users who upgrade to any paid plan each month. A key indicator of your free plan\'s effectiveness at demonstrating value.',
  newDirectPaid: 'The number of new users who sign up directly for a paid plan each month, bypassing the free tier.',
  basicPlanConversion: 'The percentage of new paid customers who choose the Basic plan. This helps model revenue distribution.',
  professionalPlanConversion: 'The percentage of new paid customers who choose the Professional plan.',
  enterprisePlanConversion: 'The percentage of new paid customers who choose the Enterprise plan.',
  basicAvgUsers: 'The average number of users per account for customers on the Basic plan. This directly impacts revenue from this tier.',
  proAvgUsers: 'The average number of users per account for customers on the Professional plan.',
  enterpriseAvgMRR: 'The average monthly recurring revenue from a single Enterprise account, as their pricing is custom.',
  monthlyChurnRate: 'The percentage of paying customers who cancel their subscription each month. Higher churn negatively impacts growth.',
  upsellRate: 'The percentage of Basic plan customers who upgrade to the Professional plan each month. This is a key driver of MRR expansion.',
};

export const ONBOARDING_TOUR_STEPS: TourStep[] = [
  {
    elementId: 'header',
    title: 'Welcome to the Dashboard!',
    description: 'This interactive dashboard lets you explore Kalmerge\'s revenue projections. Let\'s take a quick tour of the key features.',
  },
  {
    elementId: 'main-nav',
    title: 'Easy Navigation',
    description: 'Use this navigation bar to quickly jump to different sections of the strategy report.',
  },
  {
    elementId: 'pricing-table',
    title: 'Editable Pricing',
    description: 'This table isn\'t just for show. You can directly edit the prices for the Basic and Professional plans. Changes you make here will instantly update the financial projections.',
    hasAnimation: 'click',
    animationTargetId: 'editable-price-basic',
  },
  {
    elementId: 'assumptions-grid',
    title: 'Interactive Assumptions',
    description: 'This is the core of the dashboard. All the sliders here are interactive. Adjust them to see how different assumptions impact the financial forecast in real-time.',
  },
  {
    elementId: 'slider-newFreeSignups',
    title: 'Adjust a Slider',
    description: 'Try moving this slider. Watch how the charts and numbers below instantly update to reflect your changes. This allows you to model various growth scenarios.',
  },
  {
    elementId: 'charts-container',
    title: 'Dynamic Projections',
    description: 'Your projections are visualized here. You can switch between different views like MRR Growth, Revenue Composition, and Customer Flow using these tabs.',
  },
  {
    elementId: 'explain-ai-button',
    title: 'Get AI-Powered Insights',
    description: 'Feeling overwhelmed by the data? Click here, and our AI analyst will provide a step-by-step narrative explaining the story behind the current projection.',
  },
  {
    elementId: 'download-buttons',
    title: 'Export Your Work',
    description: 'You can download the currently displayed chart as an image or export the entire 36-month projection data as a CSV file.',
  },
  {
    elementId: 'cltv-card',
    title: 'Key Metrics',
    description: 'Important calculated metrics like Customer Lifetime Value (CLTV) are displayed here, updating based on your assumptions.',
  },
];

export const DEFAULT_PRICING_DATA: PricingTableData = {
    tiers: [
        { name: 'Free Plan', price: '$0', priceDetails: 'Forever', cta: 'Get Started' },
        { name: 'Basic Plan', price: '$9', priceDetails: '/user/month', cta: 'Upgrade Now' },
        { name: 'Professional Plan', price: '$29', priceDetails: '/user/month', cta: 'Upgrade Now', highlight: true },
        { name: 'Enterprise Plan', price: 'Custom', priceDetails: 'Contact Us', cta: 'Contact Sales' }
    ],
    features: [
        { name: 'Ideal For', values: ['Individuals, core value testing', 'Power users, small teams', 'Growing teams, complex scheduling', 'Large organizations, extensive needs'] },
        { name: 'Users Included', values: ['1 user', 'Up to 5 users', 'Up to 25 users', 'Unlimited users'] },
        { name: 'Calendar Integrations', values: ['1 per provider (Google, MS, Apple, Zoho)', 'Up to 3 per provider', 'Unlimited per provider', 'Unlimited per provider'] },
        { name: 'Personal Booking Links', values: ['1', 'Unlimited', 'Unlimited', 'Unlimited, advanced white-labeling'] },
        { name: 'Team Booking Links', values: ['No', 'No', 'Unlimited (round-robin, collective)', 'Unlimited, advanced team features, custom domain'] },
        { name: 'Booking Page Branding', values: ['Basic', 'Custom branding (logo, colors)', 'All Basic + Payment integrations, custom booking fields', 'All Pro + SSO, custom domain for booking pages, capacity management'] },
        { name: 'API Access', values: ['No', 'No', 'Basic (read-only, webhooks)', 'Full (read/write), custom dev support, dedicated specialists'] },
        { name: 'CRM/App Integrations', values: ['No', 'No', '5 standard (e.g., Zapier)', 'Unlimited, custom integration support'] },
        { name: 'Reporting & Analytics', values: ['No', 'No', 'Basic booking analytics', 'Customizable dashboards, detailed team & booking trend analytics'] },
        { name: 'Support', values: ['Email', 'Priority email support', 'Phone & chat support', 'Dedicated Account Manager, 24/7 priority, onboarding & training'] },
        { name: 'Security', values: ['Standard', 'Standard', 'Standard', 'Custom SLAs, advanced data residency, audit logs'] }
    ]
};

export const CONVERSION_PATH_STRATEGY = `
    The free-to-paid conversion path for Kalmerge will be designed to showcase the immediate value of the product's core features while creating clear incentives and friction points that encourage upgrades to paid tiers. Our strategy employs a feature-gated freemium model, where essential functionalities are accessible for free, but advanced capabilities, increased capacity, and collaboration features are reserved for paid subscriptions. We attract users with a genuinely useful free tier. As their needs grow, they encounter natural limitations that highlight the value of our paid plans. In-app prompts and targeted campaigns will guide users towards the plan that best solves their evolving challenges.
`;

export const GROWTH_METRICS_DEFINITIONS = {
    cltv: `Customer Lifetime Value (CLTV) is a crucial metric that estimates the total revenue a business can reasonably expect from a single customer account over the duration of their relationship. A high CLTV relative to CAC signifies a sustainable business model and healthy growth potential. A healthy CLTV justifies continued investment in marketing, sales, and product development.`,
    churn: `Churn (customer attrition) is a silent killer of SaaS growth. Our assumed 5% monthly churn rate is a starting point, and actively managing it is vital. A 5% monthly churn translates to roughly 46% annual churn, which is manageable for a new product but offers significant room for improvement.`
};

export const CHURN_RETENTION_STRATEGY = `
<h3 class="text-xl font-bold mb-4 text-primary">Churn Rate & Retention Strategy</h3>
<p class="mb-4 text-gray-600">${GROWTH_METRICS_DEFINITIONS.churn}</p>
<p class="text-gray-700 font-semibold mb-2">Key Retention Strategies:</p>
<ul class="list-disc list-inside space-y-2 text-gray-600">
    <li><strong>Robust Onboarding:</strong> Ensure users quickly achieve their "aha moment" with in-app tours and personalized setup guides.</li>
    <li><strong>Proactive Customer Support:</strong> Address issues swiftly via responsive support and a comprehensive knowledge base to build trust.</li>
    <li><strong>Continuous Value Delivery:</strong> Regularly ship feature updates and improvements, and communicate them effectively.</li>
    <li><strong>Customer Feedback Loops:</strong> Actively solicit feedback through surveys and feature request forms to make customers feel heard.</li>
    <li><strong>Usage Monitoring:</strong> Identify at-risk customers by tracking engagement and proactively reach out with support.</li>
    <li><strong>"Win-back" Campaigns:</strong> Use targeted offers for churned customers to recover lost revenue and gain insights.</li>
</ul>
`

export const GROWTH_METRICS_KPIS = [
    { name: 'Monthly Recurring Revenue (MRR)', description: 'Total predictable revenue generated from all active subscriptions in a month.' },
    { name: 'Net New MRR', description: 'MRR from new customers and upsells, minus MRR from churn and downgrades.' },
    { name: 'Free-to-Paid Conversion Rate', description: 'Percentage of free users who convert to a paid subscription.' },
    { name: 'Customer Churn Rate', description: 'Percentage of paying customers who cancel their subscription each month.' },
    { name: 'User Engagement Rate', description: 'Metrics like DAU/WAU, active integrations, and booking link usage.' },
    { name: 'Customer Acquisition Cost (CAC)', description: 'Total sales and marketing spend divided by the number of new customers.' },
    { name: 'Customer Lifetime Value (CLTV)', description: 'Estimated total revenue from a customer over their lifetime.' },
    { name: 'Upsell/Cross-sell Rate', description: 'Percentage of existing customers who upgrade or purchase additional services.' },
];

export const LONG_TERM_VISION = `
    <h3 class="text-xl font-bold mb-4 text-primary">Upsell & Cross-sell Opportunities</h3>
    <p class="mb-4">Maximizing revenue from existing customers is often more cost-effective than acquiring new ones. Kalmerge's tiered model inherently supports upsells, but we can also plan for additional cross-sell opportunities, particularly in the rapidly evolving landscape of AI.</p>
    
    <h4 class="text-lg font-semibold mb-2 text-dark">Upsell Strategies</h4>
    <ul class="list-disc list-inside space-y-2 mb-6">
        <li><strong>Feature-Based Nudges:</strong> In-app prompts when users attempt to access a feature not included in their current plan.</li>
        <li><strong>Usage-Based Triggers:</strong> Alerting users nearing the limits of their current plan.</li>
        <li><strong>Success-Based Upgrades:</strong> Proactive outreach to highly engaged users, offering to help them explore more advanced features.</li>
    </ul>

    <h4 class="text-lg font-semibold mb-2 text-dark">Cross-sell Opportunities (Potential Future Offerings)</h4>
    <ul class="list-disc list-inside space-y-2 mb-6">
        <li><strong>AI-Powered Meeting Summaries:</strong> Integrate AI to automatically transcribe meetings, summarize key points, and extract action items.</li>
        <li><strong>Smart Scheduling Assistant (AI-driven):</strong> An AI assistant that analyzes calendar patterns to suggest optimal meeting times or proactively schedule.</li>
        <li><strong>Premium Integrations:</strong> Offer integrations with specialized CRMs, ERPs, or industry-specific tools at an additional cost.</li>
        <li><strong>Advanced Analytics Add-ons:</strong> Provide deep, AI-driven insights into meeting patterns, team productivity, and conversion analytics.</li>
    </ul>
`;