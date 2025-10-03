import React from 'react';
import type { ProjectionDataPoint } from '../types';

interface ProjectionTableProps {
    data: ProjectionDataPoint[];
}

const ProjectionTable: React.FC<ProjectionTableProps> = ({ data }) => {
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:pl-6">Month</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">MRR</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Customers</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">New Customers</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Churned Customers</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Tier</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pro Tier</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enterprise Tier</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((row) => (
                        <tr key={row.month} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{row.month}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-primary font-bold">{row.mrr.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.totalCustomers}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">{row.newCustomers}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">{row.churnedCustomers}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.basicCustomers}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.proCustomers}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.entCustomers}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProjectionTable;