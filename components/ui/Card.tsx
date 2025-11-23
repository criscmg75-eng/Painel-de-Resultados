
import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ icon, title, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-200"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
