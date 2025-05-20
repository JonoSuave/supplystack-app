"use client";

import React from 'react';

interface SearchBarProps {
  defaultValue?: string;
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  defaultValue = '',
  onSearch = () => {},
  showFilters = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = React.useState(defaultValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className={`w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ${className}`}>
      <form onSubmit={handleSearch} className="flex items-center p-4">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for materials (e.g., lumber, concrete, steel)" 
          className="flex-grow px-4 py-3 text-gray-700 focus:outline-none"
        />
        <button 
          type="submit"
          className="bg-golden-yellow hover:bg-amber-500 text-white px-6 py-3 rounded-md font-medium transition-colors ml-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </form>
      
      {showFilters && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-wrap gap-3">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Filter by:</span>
            <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white" aria-label="Location filter">
              <option>Zip Code</option>
              <option>City</option>
              <option>State</option>
            </select>
          </div>
          <div className="flex items-center">
            <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white" aria-label="Quantity filter">
              <option>Quantity</option>
              <option>1-10</option>
              <option>11-50</option>
              <option>51+</option>
            </select>
          </div>
          <div className="flex items-center">
            <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white" aria-label="Vendor filter">
              <option>Vendor</option>
              <option>All Vendors</option>
              <option>Local Only</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
