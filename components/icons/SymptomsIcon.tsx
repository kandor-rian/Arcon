import React from 'react';

const SymptomsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M8 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M10.4 13.9a7 7 0 1 1 8.5 2.1" />
    <path d="M17.4 9.1a1 1 0 1 0 1.2 1.2" />
    <path d="M12.2 11.2a1 1 0 1 0 1.2 1.2" />
    <path d="M15.4 5.1a1 1 0 1 0 1.2 1.2" />
  </svg>
);

export default SymptomsIcon;