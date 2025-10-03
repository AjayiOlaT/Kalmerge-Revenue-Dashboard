import React from 'react';
import * as Recharts from 'recharts';
import type { ProjectionDataPoint } from '../types';

interface MRRCompositionAreaChartProps {
    data: ProjectionDataPoint[];
}

const MRRCompositionAreaChart: React.FC<MRRCompositionAreaChartProps> = ({ data }) => {
    const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;
    return (
        <>
            <h3 className="text-xl font-bold mb-4 text-center text-dark">MRR Composition by Plan</h3>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="month" 
                            label={{ value: 'Months', position: 'insideBottom', offset: -5, fill: '#6b7280' }} 
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
                            }}
                            labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                            formatter={(value: number, name: string) => [value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), name]}
                        />
                        <Legend wrapperStyle={{ color: '#374151', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="basicMRR" stackId="1" stroke="#A78BFA" fill="#A78BFA" name="Basic MRR" />
                        <Area type="monotone" dataKey="proMRR" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="Pro MRR" />
                        <Area type="monotone" dataKey="entMRR" stackId="1" stroke="#6D28D9" fill="#6D28D9" name="Enterprise MRR" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};

export default MRRCompositionAreaChart;