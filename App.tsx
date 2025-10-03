import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import * as Recharts from 'recharts';
import * as htmlToImage from 'html-to-image';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProjection } from './hooks/useProjection';
import { useGemini } from './hooks/useGemini';
import type { Assumptions, TourStep, EditablePrices } from './types';
import { 
    DEFAULT_ASSUMPTIONS, 
    SECTIONS, 
    EXECUTIVE_SUMMARY, 
    PRICING_DATA, 
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

type ChartType = 'line' | 'area' | 'bar' | 'pie';

const App: React.FC = () => {
    const [assumptions, setAssumptions] = useLocalStorage<Assumptions>('kalmerge-assumptions', DEFAULT_ASSUMPTIONS);
    const [editablePrices, setEditablePrices] = useState<EditablePrices>({ basic: 9, professional: 29 });
    const { projectionData, monthlyMetrics } = useProjection(assumptions, editablePrices);
    const chartRef = useRef<HTMLDivElement>(null);
    const [visibleTableRows, setVisibleTableRows] = useState(12);
    const [activeChartType, setActiveChartType] = useState<ChartType>('line');

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

    return (
        <div className="bg-light text-dark min-h-screen font-sans">
            <Header onStartTour={startOnboardingTour} />
            <Navbar />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <Section id={SECTIONS[0].id} title={SECTIONS[0].title}>
                    <p className="text-lg text-gray-700 leading-relaxed">{EXECUTIVE_SUMMARY}</p>
                </Section>

                <Section id={SECTIONS[1].id} title={SECTIONS[1].title}>
                    <div id="pricing-table" className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 w-1/5">Feature</th>
                                    {PRICING_DATA.tiers.map(tier => (
                                        <th key={tier.name} className={`p-4 w-1/5 text-center ${tier.highlight ? 'bg-violet-100 rounded-t-lg' : ''}`}>
                                            <h3 className="text-lg font-bold text-dark">{tier.name}</h3>
                                            
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

                                            <p className="text-xs text-gray-500">{tier.priceDetails}</p>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PRICING_DATA.features.map(feature => (
                                    <tr key={feature.name} className="border-b border-gray-200 last:border-b-0">
                                        <td className="p-4 font-semibold text-gray-600">{feature.name}</td>
                                        {feature.values.map((value, index) => (
                                            <td key={index} className={`p-4 text-center text-gray-700 ${PRICING_DATA.tiers[index].highlight ? 'bg-violet-100/50' : ''}`}>
                                                {value === 'No' ? <span className="text-red-500">No</span> : value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                 <tr className="bg-transparent">
                                     <td></td>
                                     {PRICING_DATA.tiers.map(tier => (
                                         <td key={tier.name} className={`p-4 text-center ${tier.highlight ? 'bg-violet-100/50 rounded-b-lg' : ''}`}>
                                             <button className={`w-full max-w-[150px] mx-auto py-2 font-bold rounded-lg transition-colors duration-300
                                                ${tier.highlight ? 'bg-primary text-white hover:bg-violet-700' : 'bg-secondary text-white hover:bg-violet-600'}`}>
                                                 {tier.cta}
                                             </button>
                                         </td>
                                     ))}
                                 </tr>
                            </tbody>
                        </table>
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