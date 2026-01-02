import React, { useId, forwardRef } from "react";
import checkboxIcon from "../../assets/checkbox.svg";

const Checkbox = forwardRef(
  (
    {
      id,
      name,
      value,
      label,
      checked = false,
      onChange,
      className = "",
      checkboxSize = "w-4 h-4",
      labelClassName = "text-sm text-[#374151] font-medium",
      required = false,
    },
    ref
  ) => {
    const autoId = useId();
    // ensure uniqueness by including value (fallback to useId)
    const safeValue = value !== undefined && value !== null ? String(value).replace(/\s+/g, "-") : autoId;
    const inputId = id || `checkbox-${name || "checkbox"}-${safeValue}`;

    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            id={inputId}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            required={required}
            className="sr-only peer"
            ref={ref}            
          />
          <label
            htmlFor={inputId}
            className={`${checkboxSize} border border-gray-300 rounded cursor-pointer flex items-center justify-center transition-all peer-checked:bg-[#1B84FF] peer-checked:border-[#1B84FF]`}
          >
            {checked && (
              <img src={checkboxIcon} alt="checked" className="w-3 h-4" />
            )}
          </label>
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className={`cursor-pointer ${labelClassName}`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

export default Checkbox;
