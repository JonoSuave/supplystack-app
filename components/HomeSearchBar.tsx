"use client";

import React from 'react';
import SearchBar from './SearchBar';
import { useRouter } from 'next/navigation';

interface HomeSearchBarProps {
  className?: string;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  className = '',
}) => {
  const router = useRouter();

  const handleSearch = (query: string) => {
    // Navigate to search page with query parameter
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <SearchBar
      onSearch={handleSearch}
      className={className}
    />
  );
};

export default HomeSearchBar;
