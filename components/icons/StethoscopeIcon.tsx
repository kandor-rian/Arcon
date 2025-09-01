
import React from 'react';

const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    {...props}
  >
    <path d="M4.8 2.3A.3.3 0 1 0 5.4 2a.3.3 0 0 0-.6.3" />
    <path d="M8.5 2.3a.3.3 0 1 0 .6 0a.3.3 0 1 0-.6 0" />
    <path d="M5.1 2.3A3.5 3.5 0 0 0 8.5 5v1" />
    <path d="M5.1 2.3A3.5 3.5 0 0 1 1.7 5v1" />
    <path d="M8.5 6V5a3.5 3.5 0 0 0-3.4-3.5" />
    <path d="M1.7 6V5A3.5 3.5 0 0 1 5.1 1.5" />
    <path d="M14 6V5a3.5 3.5 0 0 0-7 0v1" />
    <path d="M14 6h1a2 2 0 0 1 2 2v2" />
    <path d="M12 12h-1a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Z" />
    <path d="M12 12a4 4 0 0 0 4-4v-1" />
  </svg>
);

export default StethoscopeIcon;
