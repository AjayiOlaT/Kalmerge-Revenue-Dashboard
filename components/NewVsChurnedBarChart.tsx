import React from 'react';
import * as Recharts from 'recharts';
import type { ProjectionDataPoint } from '../types';

interface NewVsChurnedBarChartProps {
    data: ProjectionDataPoint[];
}

const NewVsChurnedBarChart: React.FC<NewVsChurnedBarChartProps> = ({ data }) => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;
    return (
        <>
            <h3 className="text-xl font-bold mb-4 text-center text-dark">New vs. Churned Customers per Month</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="month" 
                        label={{ value: 'Months', position: 'insideBottom', offset: -10, fill: '#6b7280' }} 
                        stroke="#9ca3af"
                        tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                        label={{ value: 'Customers', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                        stroke="#9ca3af"
                        tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                        formatter={(value: number, name: string) => [`${value.toLocaleString()} Customers`, name]}
                    />
                    <Legend wrapperStyle={{ color: '#374151', paddingTop: '10px' }} />
                    <Bar dataKey="newCustomers" name="New Customers" fill="#22c55e" />
                    <Bar dataKey="churnedCustomers" name="Churned Customers" fill="#ef4444" />
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};

export default NewVsChurnedBarChart;