import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, children, ...props }) => {
  const id = props.id || `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="relative">
      <select
        id={id}
        className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
        {...props}
      >
        {children}
      </select>
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600"
      >
        {label}
      </label>
    </div>
  );
};

export default Select;
