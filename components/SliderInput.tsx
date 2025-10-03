import React from 'react';
import InfoTooltip from './InfoTooltip';

interface SliderInputProps {
    id?: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    format?: 'currency' | 'percent' | 'number';
    tooltip?: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ id, label, value, onChange, min, max, step, format = 'number', tooltip }) => {
    const displayValue = () => {
        switch (format) {
            case 'currency':
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
            case 'percent':
                return `${value.toFixed(1)}%`;
            default:
                return value.toLocaleString();
        }
    };

    return (
        <div id={id} className="w-full">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-600">{label}</label>
                    {tooltip && <InfoTooltip text={tooltip} />}
                </div>
                <span className="text-sm font-semibold text-primary bg-violet-100 px-2 py-1 rounded">{displayValue()}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
        </div>
    );
};

export default SliderInput;