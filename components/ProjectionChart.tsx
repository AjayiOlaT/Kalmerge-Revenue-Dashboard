import React from 'react';
import * as Recharts from 'recharts';
import type { ProjectionDataPoint } from '../types';

interface MRRLineChartProps {
    data: ProjectionDataPoint[];
}

const MRRLineChart: React.FC<MRRLineChartProps> = ({ data }) => {
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;
    return (
        <>
            <h3 className="text-xl font-bold mb-4 text-center text-dark">Projected Monthly Recurring Revenue (MRR)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="month" 
                        label={{ value: 'Months', position: 'insideBottom', offset: -10, fill: '#6b7280' }} 
                        stroke="#9ca3af"
                        tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                        tickFormatter={(value) => `$${(value as number / 1000)}k`} 
                        label={{ value: 'MRR', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                        stroke="#9ca3af"
                        tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '0.5rem', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
                        }}
                        labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                        formatter={(value: number) => [value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), 'MRR']}
                    />
                    <Legend wrapperStyle={{ color: '#374151', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="mrr" name="Projected MRR" stroke="#6D28D9" strokeWidth={3} dot={false} activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2, fill: '#6D28D9' }} />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};

export default MRRLineChart;