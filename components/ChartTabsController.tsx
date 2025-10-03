import React from 'react';
import type { ProjectionDataPoint, ChartType } from '../types';
import MRRLineChart from './ProjectionChart';
import MRRCompositionAreaChart from './MRRCompositionAreaChart';
import NewVsChurnedBarChart from './NewVsChurnedBarChart';
import CustomerCompositionPieChart from './CustomerCompositionPieChart';

interface ChartTabsControllerProps {
    data: ProjectionDataPoint[];
    activeChart: ChartType;
    setActiveChart: (chart: ChartType) => void;
}

const ChartTabsController: React.FC<ChartTabsControllerProps> = ({ data, activeChart, setActiveChart }) => {
    const chartTabs: { id: ChartType; label: string }[] = [
        { id: 'line', label: 'MRR Growth' },
        { id: 'area', label: 'MRR Composition' },
        { id: 'bar', label: 'Customer Flow' },
        { id: 'pie', label: 'Final Customer Mix' },
    ];

    const renderChart = () => {
        switch (activeChart) {
            case 'line':
                return <MRRLineChart data={data} />;
            case 'area':
                return <MRRCompositionAreaChart data={data} />;
            case 'bar':
                return <NewVsChurnedBarChart data={data} />;
            case 'pie':
                return <CustomerCompositionPieChart data={data[data.length - 1]} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Tabs */}
                <div className="flex flex-row md:flex-col md:w-1/4 lg:w-1/5 space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-visible -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
                    {chartTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveChart(tab.id)}
                            className={`p-4 rounded-lg text-left font-semibold w-auto md:w-full flex-shrink-0 transition-all duration-300 transform
                                ${activeChart === tab.id
                                    ? 'bg-primary text-white shadow-lg md:-translate-x-2'
                                    : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-primary'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Chart Display Area */}
                <div className="flex-grow md:w-3/4 lg:w-4/5 min-h-[300px] sm:min-h-[400px]">
                    <div className="w-full h-[300px] sm:h-[400px]">
                        {renderChart()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartTabsController;
