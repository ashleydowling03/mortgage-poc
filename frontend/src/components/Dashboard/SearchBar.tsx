import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
}) => {
  return (
    <div style={{
      marginBottom: 32,
    }}>
      <div style={{
        position: 'relative',
        maxWidth: 600,
      }}>
        {/* Search Icon */}
        <svg
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 20,
            height: 20,
            color: '#6c757d',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '14px 48px 14px 48px',
            border: '2px solid #dee2e6',
            borderRadius: 8,
            fontSize: 15,
            fontFamily: 'inherit',
            background: '#fff',
            transition: 'all 0.2s',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2d4a4f';
            e.target.style.boxShadow = '0 0 0 3px rgba(45, 74, 79, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#dee2e6';
            e.target.style.boxShadow = 'none';
          }}
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24,
              height: 24,
              border: 'none',
              borderRadius: '50%',
              background: '#dee2e6',
              color: '#6c757d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#6c757d';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dee2e6';
              e.currentTarget.style.color = '#6c757d';
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;