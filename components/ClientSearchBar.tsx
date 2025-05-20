"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SearchBar from './SearchBar';

interface ClientSearchBarProps {
  defaultValue?: string;
  className?: string;
}

const ClientSearchBar: React.FC<ClientSearchBarProps> = ({
  defaultValue = '',
  className = '',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleSearch = (query: string) => {
    console.log('[SEARCH BAR DEBUG] Searching for:', query);
    if (query && query.trim() !== '') {
      const searchQuery = encodeURIComponent(query.trim());
      console.log('[SEARCH BAR DEBUG] Encoded search query:', searchQuery);
      
      // Check if we're already on the search page
      if (pathname === '/search') {
        // Use router.replace to update the URL without adding to history stack
        console.log('[SEARCH BAR DEBUG] Already on search page, replacing URL with new query:', query);
        
        // Instead of forcing a page refresh, just update the URL
        // This allows the useEffect in the search page to detect the query change
        router.replace(`/search?query=${searchQuery}`);
      } else {
        // Normal navigation to search page
        console.log('[SEARCH BAR DEBUG] Navigating to search page with query:', query);
        router.push(`/search?query=${searchQuery}`);
      }
    }
  };

  return (
    <SearchBar
      defaultValue={defaultValue}
      onSearch={handleSearch}
      className={className}
    />
  );
};

export default ClientSearchBar;
