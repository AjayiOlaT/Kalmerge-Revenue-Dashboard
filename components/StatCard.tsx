import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-light text-primary rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-dark mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    );
};

export default StatCard;