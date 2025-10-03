import React from 'react';

interface SectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    controls?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, children, controls }) => {
    return (
        <section id={id} className="py-12 md:py-16">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-dark border-l-4 border-primary pl-4">
                    {title}
                </h2>
                {controls && <div className="flex-shrink-0">{controls}</div>}
            </div>
            {children}
        </section>
    );
};

export default Section;