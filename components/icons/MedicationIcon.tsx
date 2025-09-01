import React from 'react';

const MedicationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-6 w-6 text-cyan-500"
    {...props}
  >
    <path d="M9.5 2.5a5.5 5.5 0 0 0 0 11" />
    <path d="M14 12.5a5.5 5.5 0 1 0 0-11" />
    <path d="m20.2 12.8-8.4 8.4" />
    <path d="m14.8 18.2 5.4-5.4" />
  </svg>
);

export default MedicationIcon;