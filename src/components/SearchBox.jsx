import React from 'react';
import { Search } from 'lucide-react';

function SearchBox({ value, onChange, placeholder, className = "" }) {
    return (
            <div className={`relative ${className}`}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="border w-full border-[#DBDFE9] bg-neutral-input rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-0 focus:outline-none focus:border-[#DBDFE9]"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

    );
}

export default SearchBox;