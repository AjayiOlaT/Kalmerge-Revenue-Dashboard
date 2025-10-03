import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import * as Recharts from 'recharts';
import * as htmlToImage from 'html-to-image';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProjection } from './hooks/useProjection';
import { useGemini } from './hooks/useGemini';
import type { Assumptions, TourStep, EditablePrices, PricingTableData, Tier, Feature } from './types';
import { 
    DEFAULT_ASSUMPTIONS, 
    SECTIONS, 
    DEFAULT_PRICING_DATA, 
    CONVERSION_PATH_STRATEGY, 
    GROWTH_METRICS_KPIS, 
    LONG_TERM_VISION,
    GROWTH_METRICS_DEFINITIONS,
    CHURN_RETENTION_STRATEGY,
    ASSUMPTION_TOOLTIPS,
    ONBOARDING_TOUR_STEPS
} from './constants';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Section from './components/Section';
import SliderInput from './components/SliderInput';
import MRRLineChart from './components/ProjectionChart';
import ProjectionTable from './components/ProjectionTable';
import CustomerCompositionPieChart from './components/CustomerCompositionPieChart';
import NewVsChurnedBarChart from './components/NewVsChurnedBarChart';
import MRRCompositionAreaChart from './components/MRRCompositionAreaChart';
import AIGuidedTour from './components/AIGuidedTour';
import OnboardingTour from './components/OnboardingTour';
import StatCard from './components/StatCard';

type ChartType = 'line' | 'area' | 'bar' | 'pie';

const App: React.FC = () => {
    const [assumptions, setAssumptions] = useLocalStorage<Assumptions>('kalmerge-assumptions', DEFAULT_ASSUMPTIONS);
    const [editablePrices, setEditablePrices] = useState<EditablePrices>({ basic: 9, professional: 29 });
    const { projectionData, monthlyMetrics } = useProjection(assumptions, editablePrices);
    const chartRef = useRef<HTMLDivElement>(null);
    const [visibleTableRows, setVisibleTableRows] = useState(12);
    const [activeChartType, setActiveChartType] = useState<ChartType>('line');

    const [pricingData, setPricingData] = useLocalStorage<PricingTableData>('kalmerge-pricing-data', DEFAULT_PRICING_DATA);

    // AI Tour State
    const { generateExplanation, isLoading: isGenerating, error: generationError } = useGemini();
    const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
    const [currentTourStepIndex, setCurrentTourStepIndex] = useState(0);
    const [isTourActive, setIsTourActive] = useState(false);

    // Onboarding Tour State
    const [isOnboardingTourActive, setIsOnboardingTourActive] = useState(false);
    const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);
    const [hasCompletedTour, setHasCompletedTour] = useLocalStorage('kalmerge-tour-completed', false);

    useEffect(() => {
        if (!hasCompletedTour && !isTourActive && !isOnboardingTourActive) {
            const timer = setTimeout(() => {
                startOnboardingTour();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [hasCompletedTour]);
    
    const isAnyTourActive = isTourActive || isOnboardingTourActive;
    
    useEffect(() => {
        if (isAnyTourActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isAnyTourActive]);

    const handleAssumptionChange = (key: keyof Assumptions, value: number) => {
        setAssumptions(prev => {
            const newAssumptions = { ...prev, [key]: value };

            if (key === 'basicPlanConversion' || key === 'professionalPlanConversion' || key === 'enterprisePlanConversion') {
                const total = newAssumptions.basicPlanConversion + newAssumptions.professionalPlanConversion + newAssumptions.enterprisePlanConversion;
                if (total > 100) {
                    const diff = total - 100;
                    if (key !== 'basicPlanConversion' && newAssumptions.basicPlanConversion > diff / 2) newAssumptions.basicPlanConversion -= diff / 2;
                    if (key !== 'professionalPlanConversion' && newAssumptions.professionalPlanConversion > diff / 2) newAssumptions.professionalPlanConversion -= diff / 2;
                    if (key !== 'enterprisePlanConversion' && newAssumptions.enterprisePlanConversion > diff / 2) newAssumptions.enterprisePlanConversion -= diff / 2;
                }
            }
            return newAssumptions;
        });
    };
    
    const handlePriceChange = (plan: 'basic' | 'professional', value: string) => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
            setEditablePrices(prev => ({ ...prev, [plan]: numericValue }));
        }
    };
    
    const handleTierChange = (tierIndex: number, field: keyof Tier, value: string) => {
        setPricingData(currentData => {
            const updatedTiers = [...currentData.tiers];
            updatedTiers[tierIndex] = { ...updatedTiers[tierIndex], [field]: value };
            return { ...currentData, tiers: updatedTiers };
        });
    };
    const handleFeatureNameChange = (featureIndex: number, value: string) => {
         setPricingData(currentData => {
            const updatedFeatures = [...currentData.features];
            updatedFeatures[featureIndex] = { ...updatedFeatures[featureIndex], name: value };
            return { ...currentData, features: updatedFeatures };
        });
    };
    const handleFeatureValueChange = (featureIndex: number, valueIndex: number, value: string) => {
         setPricingData(currentData => {
            const updatedFeatures = [...currentData.features];
            const newValues = [...updatedFeatures[featureIndex].values];
            newValues[valueIndex] = value;
            updatedFeatures[featureIndex] = { ...updatedFeatures[featureIndex], values: newValues };
            return { ...currentData, features: updatedFeatures };
        });
    };
    const handleAddFeature = () => {
        setPricingData(currentData => ({
            ...currentData,
            features: [
                ...currentData.features,
                { name: 'New Feature', values: Array(currentData.tiers.length).fill('') }
            ]
        }));
    };
    const handleRemoveFeature = (featureIndex: number) => {
        setPricingData(currentData => ({
            ...currentData,
            features: currentData.features.filter((_, i) => i !== featureIndex)
        }));
    };
    const handleResetPricing = () => {
        setPricingData(DEFAULT_PRICING_DATA);
    };


    const downloadChart = useCallback(() => {
        if (chartRef.current) {
            htmlToImage.toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `kalmerge-projection-${activeChartType}.png`;
                    link.href = dataUrl;
                    link.click();
                });
        }
    }, [activeChartType]);

    const downloadData = useCallback(() => {
        const headers = ['Month', 'MRR', 'Total Customers', 'New Customers', 'Churned Customers', 'Basic Customers', 'Pro Customers', 'Enterprise Customers', 'Basic MRR', 'Pro MRR', 'Enterprise MRR'];
        const rows = projectionData.map(d => [d.month, d.mrr, d.totalCustomers, d.newCustomers, d.churnedCustomers, d.basicCustomers, d.proCustomers, d.entCustomers, d.basicMRR, d.proMRR, d.entMRR].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'kalmerge_projection_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [projectionData]);
    
    const handleShowMore = () => {
        setVisibleTableRows(prev => Math.min(prev + 12, projectionData.length));
    };

    // AI Tour Handlers
    const handleExplainClick = async () => {
        const tour = await generateExplanation(assumptions, projectionData);
        if (tour && tour.length > 0) {
            setTourSteps(tour);
            setCurrentTourStepIndex(0);
            const firstStep = tour[0];
            if (firstStep.preAction?.type === 'switch_chart') {
                setActiveChartType(firstStep.preAction.payload as ChartType);
            }
            setTimeout(() => setIsTourActive(true), 100);
        }
    };
    const handleNextStep = () => {
        const nextStepIndex = currentTourStepIndex + 1;
        if (nextStepIndex < tourSteps.length) {
            const nextStep = tourSteps[nextStepIndex];
            if (nextStep.preAction?.type === 'switch_chart') {
                setActiveChartType(nextStep.preAction.payload as ChartType);
            }
            setCurrentTourStepIndex(nextStepIndex);
        }
    };
    const handlePrevStep = () => {
        const prevStepIndex = currentTourStepIndex - 1;
        if (prevStepIndex >= 0) {
            const prevStep = tourSteps[prevStepIndex];
            if (prevStep.preAction?.type === 'switch_chart') {
                setActiveChartType(prevStep.preAction.payload as ChartType);
            }
            setCurrentTourStepIndex(prevStepIndex);
        }
    };
    const handleFinishTour = () => {
        setIsTourActive(false);
        setTourSteps([]);
        setCurrentTourStepIndex(0);
    };

    // Onboarding Tour Handlers
    const startOnboardingTour = () => {
        setCurrentOnboardingStep(0);
        setIsOnboardingTourActive(true);
    };
    const handleNextOnboardingStep = () => {
        setCurrentOnboardingStep(prev => prev + 1);
    };
    const handlePrevOnboardingStep = () => {
        setCurrentOnboardingStep(prev => prev - 1);
    };
    const handleFinishOnboardingTour = () => {
        setIsOnboardingTourActive(false);
        setHasCompletedTour(true);
    };
    
    const handleAnimatePrice = useCallback(() => {
        const originalPrice = 9;
        const animationDuration = 5000; // 5s, matching CSS

        // Times are slightly delayed from the CSS animation to ensure the 'click' visual happens first.
        const incrementTimer = setTimeout(() => {
            setEditablePrices(prev => ({ ...prev, basic: originalPrice + 1 }));
        }, animationDuration * 0.30); // 1500ms

        const decrementTimer = setTimeout(() => {
            setEditablePrices(prev => ({ ...prev, basic: originalPrice - 1 }));
        }, animationDuration * 0.80); // 4000ms

        // A timer to ensure reset happens even if the animation loop in CSS is slightly off.
        const finalResetTimer = setTimeout(() => {
            setEditablePrices(prev => ({ ...prev, basic: originalPrice }));
        }, animationDuration - 50);

        const cleanup = () => {
            clearTimeout(incrementTimer);
            clearTimeout(decrementTimer);
            clearTimeout(finalResetTimer);
            setEditablePrices(prev => ({ ...prev, basic: originalPrice }));
        };

        return cleanup;
    }, []);

    const arpa = useMemo(() => {
        if (monthlyMetrics.totalCustomers === 0) return 0;
        return monthlyMetrics.totalMRR / monthlyMetrics.totalCustomers;
    }, [monthlyMetrics]);

    const cltv = useMemo(() => {
        const churnRate = assumptions.monthlyChurnRate / 100;
        if (churnRate === 0) return Infinity;
        return arpa / churnRate;
    }, [arpa, assumptions.monthlyChurnRate]);

    const kpiIndicators = useMemo(() => ({
        "Monthly Recurring Revenue (MRR)": monthlyMetrics.totalMRR > 50000 ? "green" : (monthlyMetrics.totalMRR > 10000 ? "yellow" : "red"),
        "Net New MRR": "yellow",
        "Free-to-Paid Conversion Rate": assumptions.freeToPaidConversion > 3 ? "green" : (assumptions.freeToPaidConversion > 1.5 ? "yellow" : "red"),
        "Customer Churn Rate": assumptions.monthlyChurnRate < 5 ? "green" : (assumptions.monthlyChurnRate < 8 ? "yellow" : "red"),
        "User Engagement Rate": "yellow",
        "Customer Acquisition Cost (CAC)": "yellow",
        "Customer Lifetime Value (CLTV)": cltv > 1000 ? "green" : (cltv > 500 ? "yellow" : "red"),
        "Upsell/Cross-sell Rate": "yellow",
    }), [cltv, monthlyMetrics.totalMRR, assumptions.monthlyChurnRate, assumptions.freeToPaidConversion]);

    const chartTabs: { id: ChartType; label: string }[] = [
        { id: 'line', label: 'MRR Growth' },
        { id: 'area', label: 'MRR Composition' },
        { id: 'bar', label: 'Customer Flow' },
        { id: 'pie', label: 'Final Customer Mix' },
    ];
    
    const inputClasses = "bg-transparent hover:bg-violet-100/50 focus:bg-white w-full p-1 rounded focus:outline-none focus:ring-2 focus:ring-secondary transition-colors";


    return (
        <div className="bg-light text-dark min-h-screen font-sans">
            <Header onStartTour={startOnboardingTour} />
            <Navbar />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-dark tracking-tight sm:text-5xl">
                        Interactive Revenue Projection Planner
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
                        Welcome to your strategic planning tool. Adjust the assumptions below to dynamically model Kalmerge's growth trajectory and explore potential revenue outcomes in real-time.
                    </p>
                </div>
                
                <Section id={SECTIONS[0].id} title={SECTIONS[0].title}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard 
                            title="Projected 36-Mo MRR"
                            value={monthlyMetrics.totalMRR.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                            description="Total monthly recurring revenue after 3 years."
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                         <StatCard 
                            title="Final Customer Count"
                            value={monthlyMetrics.totalCustomers.toLocaleString()}
                            description="Total active paying customers at month 36."
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                         <StatCard 
                            title="Projected CLTV"
                            value={cltv.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                            description="Estimated revenue from a single customer."
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                        />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold text-dark mb-3">Dynamic Strategic Overview</h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Building upon the successful MVP launch, this dynamic model projects a growth trajectory to <strong className="text-primary">{monthlyMetrics.totalMRR.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} in MRR</strong> and <strong className="text-primary">{monthlyMetrics.totalCustomers.toLocaleString()} paying customers</strong> over 36 months.
                            <br/><br/>
                            The strategy centers on a tiered, feature-gated freemium model designed to maximize Customer Lifetime Value (CLTV), which currently stands at <strong className="text-primary">{cltv.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</strong> based on your assumptions. The key levers for success are a compelling free-to-paid conversion funnel and robust retention strategies to manage the projected <strong className="text-primary">{assumptions.monthlyChurnRate}% monthly churn rate</strong>. Use the sliders below to explore how changes in these core assumptions impact the overall forecast.
                        </p>
                    </div>
                </Section>

                <Section id={SECTIONS[1].id} title={SECTIONS[1].title}>
                    <div id="pricing-table" className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 w-1/5">Feature</th>
                                    {pricingData.tiers.map((tier, tierIndex) => (
                                        <th key={tierIndex} className={`p-4 w-1/5 text-center ${tier.highlight ? 'bg-violet-100 rounded-t-lg' : ''}`}>
                                            <input 
                                                type="text"
                                                value={tier.name}
                                                onChange={(e) => handleTierChange(tierIndex, 'name', e.target.value)}
                                                className={`${inputClasses} text-lg font-bold text-dark text-center`}
                                                aria-label={`${tier.name} name`}
                                            />
                                            
                                            {tier.name === 'Basic Plan' ? (
                                                <div className="relative inline-flex items-center justify-center my-1">
                                                    <span className="text-2xl font-extrabold text-primary mr-1">$</span>
                                                    <input 
                                                        id="editable-price-basic"
                                                        type="number"
                                                        value={editablePrices.basic}
                                                        onChange={(e) => handlePriceChange('basic', e.target.value)}
                                                        className="w-20 bg-violet-100/50 text-center text-2xl font-extrabold text-primary focus:outline-none focus:ring-2 focus:ring-secondary rounded-md"
                                                        aria-label="Basic Plan Price"
                                                    />
                                                </div>
                                            ) : tier.name === 'Professional Plan' ? (
                                                <div className="relative inline-flex items-center justify-center my-1">
                                                    <span className="text-2xl font-extrabold text-primary mr-1">$</span>
                                                    <input 
                                                        type="number"
                                                        value={editablePrices.professional}
                                                        onChange={(e) => handlePriceChange('professional', e.target.value)}
                                                        className="w-20 bg-violet-100 text-center text-2xl font-extrabold text-primary focus:outline-none focus:ring-2 focus:ring-secondary rounded-md"
                                                        aria-label="Professional Plan Price"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-extrabold text-primary my-1">{tier.price}</p>
                                            )}
                                             <input 
                                                type="text"
                                                value={tier.priceDetails}
                                                onChange={(e) => handleTierChange(tierIndex, 'priceDetails', e.target.value)}
                                                className={`${inputClasses} text-xs text-gray-500 text-center`}
                                                aria-label={`${tier.name} price details`}
                                            />
                                        </th>
                                    ))}
                                    <th className="p-4 w-[50px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pricingData.features.map((feature, featureIndex) => (
                                    <tr key={featureIndex} className="border-b border-gray-200 last:border-b-0">
                                        <td className="p-2 font-semibold text-gray-600">
                                            <input 
                                                type="text"
                                                value={feature.name}
                                                onChange={(e) => handleFeatureNameChange(featureIndex, e.target.value)}
                                                className={inputClasses}
                                                aria-label={`Feature name ${featureIndex + 1}`}
                                            />
                                        </td>
                                        {feature.values.map((value, valueIndex) => (
                                            <td key={valueIndex} className={`p-2 text-center text-gray-700 ${pricingData.tiers[valueIndex].highlight ? 'bg-violet-100/50' : ''}`}>
                                                 <input 
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => handleFeatureValueChange(featureIndex, valueIndex, e.target.value)}
                                                    className={`${inputClasses} text-center`}
                                                    aria-label={`Feature ${feature.name} for ${pricingData.tiers[valueIndex].name}`}
                                                />
                                            </td>
                                        ))}
                                        <td className={`p-2 text-center ${pricingData.tiers.some(t => t.highlight) ? 'bg-violet-100/50' : ''}`}>
                                            <button onClick={() => handleRemoveFeature(featureIndex)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors" aria-label={`Remove feature ${feature.name}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                 <tr className="bg-transparent">
                                     <td></td>
                                     {pricingData.tiers.map((tier, tierIndex) => (
                                         <td key={tierIndex} className={`p-4 text-center ${tier.highlight ? 'bg-violet-100/50 rounded-b-lg' : ''}`}>
                                             <button className={`w-full max-w-[150px] mx-auto py-2 font-bold rounded-lg transition-colors duration-300
                                                ${tier.highlight ? 'bg-primary text-white hover:bg-violet-700' : 'bg-secondary text-white hover:bg-violet-600'}`}>
                                                 {tier.cta}
                                             </button>
                                         </td>
                                     ))}
                                     <td></td>
                                 </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end space-x-4">
                        <button onClick={handleAddFeature} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                           + Add Feature
                        </button>
                        <button onClick={handleResetPricing} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                           Reset Pricing
                        </button>
                    </div>
                </Section>
                
                <Section id={SECTIONS[2].id} title={SECTIONS[2].title}>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed">{CONVERSION_PATH_STRATEGY}</p>
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                        {['Discovery (Free)', 'Triggering Upgrade Needs', 'Conversion', 'Onboarding to Paid'].map((step, index, arr) => (
                             <React.Fragment key={step}>
                                <div className="flex flex-col items-center text-center">
                                    <div className="bg-primary rounded-full w-24 h-24 flex items-center justify-center text-white font-bold text-4xl mb-2 shadow-lg">{index + 1}</div>
                                    <h3 className="font-semibold text-lg text-dark">{step}</h3>
                                </div>
                                {index < arr.length - 1 && <div className="text-4xl text-secondary font-light hidden md:block">→</div>}
                             </React.Fragment>
                        ))}
                    </div>
                </Section>

                <Section id={SECTIONS[3].id} title={SECTIONS[3].title}>
                     <div id="assumptions-grid" className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                            <SliderInput id="slider-newFreeSignups" label="New Free Sign-ups / mo" value={assumptions.newFreeSignups} onChange={v => handleAssumptionChange('newFreeSignups', v)} min={100} max={5000} step={100} tooltip={ASSUMPTION_TOOLTIPS.newFreeSignups} />
                            <SliderInput label="Free-to-Paid Conversion" value={assumptions.freeToPaidConversion} onChange={v => handleAssumptionChange('freeToPaidConversion', v)} min={0.5} max={10} step={0.1} format="percent" tooltip={ASSUMPTION_TOOLTIPS.freeToPaidConversion} />
                            <SliderInput label="New Direct Paid Acqs / mo" value={assumptions.newDirectPaid} onChange={v => handleAssumptionChange('newDirectPaid', v)} min={0} max={50} step={1} tooltip={ASSUMPTION_TOOLTIPS.newDirectPaid} />
                            <SliderInput label="Basic Plan Conversion" value={assumptions.basicPlanConversion} onChange={v => handleAssumptionChange('basicPlanConversion', v)} min={0} max={100} step={1} format="percent" tooltip={ASSUMPTION_TOOLTIPS.basicPlanConversion} />
                            <SliderInput label="Professional Plan Conversion" value={assumptions.professionalPlanConversion} onChange={v => handleAssumptionChange('professionalPlanConversion', v)} min={0} max={100} step={1} format="percent" tooltip={ASSUMPTION_TOOLTIPS.professionalPlanConversion} />
                            <SliderInput label="Enterprise Plan Conversion" value={assumptions.enterprisePlanConversion} onChange={v => handleAssumptionChange('enterprisePlanConversion', v)} min={0} max={100} step={1} format="percent" tooltip={ASSUMPTION_TOOLTIPS.enterprisePlanConversion} />
                            <SliderInput label="Basic Plan Avg. Users" value={assumptions.basicAvgUsers} onChange={v => handleAssumptionChange('basicAvgUsers', v)} min={1} max={5} step={0.1} tooltip={ASSUMPTION_TOOLTIPS.basicAvgUsers} />
                            <SliderInput label="Professional Plan Avg. Users" value={assumptions.proAvgUsers} onChange={v => handleAssumptionChange('proAvgUsers', v)} min={2} max={20} step={0.5} tooltip={ASSUMPTION_TOOLTIPS.proAvgUsers} />
                            <SliderInput label="Enterprise Plan Avg. MRR" value={assumptions.enterpriseAvgMRR} onChange={v => handleAssumptionChange('enterpriseAvgMRR', v)} min={200} max={2000} step={50} format="currency" tooltip={ASSUMPTION_TOOLTIPS.enterpriseAvgMRR} />
                            <SliderInput label="Monthly Churn Rate" value={assumptions.monthlyChurnRate} onChange={v => handleAssumptionChange('monthlyChurnRate', v)} min={1} max={15} step={0.1} format="percent" tooltip={ASSUMPTION_TOOLTIPS.monthlyChurnRate} />
                            <SliderInput label="Upsell Rate (Basic to Pro)" value={assumptions.upsellRate} onChange={v => handleAssumptionChange('upsellRate', v)} min={0} max={5} step={0.1} format="percent" tooltip={ASSUMPTION_TOOLTIPS.upsellRate} />
                        </div>
                     </div>
                     <div className="mt-8">
                        <div className="flex justify-end space-x-4 mb-4">
                            <button id="explain-ai-button" onClick={handleExplainClick} disabled={isGenerating} className="bg-accent hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing...
                                    </>
                                ) : '✨ Explain with AI'}
                            </button>
                            <div id="download-buttons" className="flex space-x-4">
                                <button onClick={downloadChart} className="bg-primary hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Download Chart</button>
                                <button onClick={downloadData} className="bg-secondary hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Download Data</button>
                            </div>
                        </div>
                        {generationError && <div className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-center">{generationError}</div>}
                        <div id="charts-container" ref={chartRef} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex justify-center flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
                                {chartTabs.map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveChartType(tab.id)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                                            activeChartType === tab.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-primary'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            
                            {activeChartType === 'line' && <MRRLineChart data={projectionData} />}
                            {activeChartType === 'area' && <MRRCompositionAreaChart data={projectionData} />}
                            {activeChartType === 'bar' && <NewVsChurnedBarChart data={projectionData} />}
                            {activeChartType === 'pie' && <CustomerCompositionPieChart data={projectionData[projectionData.length - 1]} />}
                        </div>
                        <div id="projection-table" className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                             <ProjectionTable data={projectionData.slice(0, visibleTableRows)} />
                             {visibleTableRows < projectionData.length && (
                                <div className="mt-6 text-center">
                                    <button onClick={handleShowMore} className="bg-secondary hover:bg-violet-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                                        Show More
                                    </button>
                                </div>
                             )}
                        </div>
                     </div>
                </Section>
                
                <Section id={SECTIONS[4].id} title={SECTIONS[4].title}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div id="cltv-card" className="bg-white p-6 rounded-lg shadow-md border border-gray-200 lg:col-span-1">
                             <h3 className="text-xl font-bold mb-4 text-primary">Customer Lifetime Value (CLTV)</h3>
                             <div className="text-5xl font-bold text-dark mb-4">{cltv.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                             <p className="text-gray-500 font-mono bg-gray-100 p-2 rounded">CLTV = ARPA / Monthly Churn Rate</p>
                             <p className="mt-4 text-gray-600">{GROWTH_METRICS_DEFINITIONS.cltv}</p>
                        </div>
                        <div id="kpi-list" className="bg-white p-6 rounded-lg shadow-md border border-gray-200 lg:col-span-2">
                            <h3 className="text-xl font-bold mb-4 text-primary">Key Performance Indicators</h3>
                            <ul className="space-y-4">
                                {GROWTH_METRICS_KPIS.map(kpi => (
                                    <li key={kpi.name} className="flex items-start">
                                         <div className={`w-4 h-4 rounded-full mr-3 mt-1 flex-shrink-0 ${
                                             kpiIndicators[kpi.name as keyof typeof kpiIndicators] === 'green' ? 'bg-green-500' :
                                             kpiIndicators[kpi.name as keyof typeof kpiIndicators] === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                         }`}></div>
                                         <div>
                                            <span className="font-semibold text-dark">{kpi.name}: </span>
                                            <span className="text-gray-600">{kpi.description}</span>
                                         </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 md:col-span-2 lg:col-span-3 prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: CHURN_RETENTION_STRATEGY }}>
                        </div>
                    </div>
                </Section>

                <Section id={SECTIONS[5].id} title={SECTIONS[5].title}>
                    <div className="prose max-w-none text-gray-600 text-lg bg-white p-6 rounded-lg shadow-md border border-gray-200" dangerouslySetInnerHTML={{ __html: LONG_TERM_VISION }}></div>
                </Section>
            </main>
            {isTourActive && tourSteps.length > 0 && (
                <AIGuidedTour
                    steps={tourSteps}
                    currentStep={currentTourStepIndex}
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                    onFinish={handleFinishTour}
                />
            )}
            {isOnboardingTourActive && (
                 <OnboardingTour
                    steps={ONBOARDING_TOUR_STEPS}
                    currentStep={currentOnboardingStep}
                    onNext={handleNextOnboardingStep}
                    onPrev={handlePrevOnboardingStep}
                    onFinish={handleFinishOnboardingTour}
                    onAnimateStep={handleAnimatePrice}
                 />
            )}
        </div>
    );
};

export default App;