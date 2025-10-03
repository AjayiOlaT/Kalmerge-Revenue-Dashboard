import React from 'react';
import * as Recharts from 'recharts';
import type { ProjectionDataPoint } from '../types';

interface CustomerCompositionPieChartProps {
    data: ProjectionDataPoint;
}

const COLORS = {
    basic: '#A78BFA', // accent
    pro: '#8B5CF6', // secondary
    ent: '#6D28D9', // primary
};

const CustomerCompositionPieChart: React.FC<CustomerCompositionPieChartProps> = ({ data }) => {
    const { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } = Recharts;

    if (!data) {
        return <div className="text-center text-gray-500">No data available for pie chart.</div>;
    }

    const pieData = [
        { name: 'Basic Tier', value: data.basicCustomers, color: COLORS.basic },
        { name: 'Pro Tier', value: data.proCustomers, color: COLORS.pro },
        { name: 'Enterprise Tier', value: data.entCustomers, color: COLORS.ent },
    ].filter(item => item.value > 0);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

        if (percent < 0.05) return null; // Don't render label if slice is too small

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <>
            <h3 className="text-xl font-bold mb-4 text-center text-dark">Customer Composition (Month 36)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={'80%'}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {pieData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '0.5rem',
                        }}
                        formatter={(value: number, name: string) => [`${value.toLocaleString()} Customers`, name]}
                    />
                    <Legend wrapperStyle={{ color: '#374151', paddingTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </>
    );
};

export default CustomerCompositionPieChart;