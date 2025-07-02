import React, { useState, useEffect } from 'react';
import Input from '@/components/atoms/Input';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  suggestions = [],
  debounceMs = 300,
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch, debounceMs]);

  useEffect(() => {
    if (query && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query, suggestions]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        icon="Search"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="pr-10"
      />

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-elevation-2 max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="text-sm text-gray-900">{suggestion}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;