import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EyeIcon from "../assets/icons/Eye-icon.svg";
import EyeOffIcon from "../assets/icons/EyeClosed-icon.svg";

export default function CustomTextField({
  label,
  type = "text",
  placeholder = "Enter value",
  error,
  options = [],
  isSelect = false,
  isTextArea = false,
  isToggle = false,
  isRadio = false,
  isMultiSelect = false,
  size = "md",
  className = "",
  inputClassName = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(
    props.value || (options.length > 0 ? options[0].value : "")
  );

  const selectWrapperRef = useRef(null);

  useEffect(() => {
    if (props.value !== undefined && props.value !== selected) {
      setSelected(props.value);
    }
  }, [props.value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectWrapperRef.current &&
        !selectWrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  };

  const navigate = useNavigate();

  const hasMarginOverride =
    className?.includes("mb-0") || className?.includes("!mb-0");
  const marginClass = hasMarginOverride ? "" : "";

  const hasWidthOverride =
    className?.includes("w-auto") || className?.includes("!w-auto");
  const widthClass = hasWidthOverride ? "" : "w-full";

  return (
    <div className={`${widthClass} ${marginClass} ${className}`}>
      {label && (
        <label
          htmlFor={props.name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Toggle */}
        {isToggle ? (
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              checked={props.value}
              onChange={(e) =>
                props.onChange?.({
                  target: { name: props.name, value: e.target.checked },
                })
              }
              className="sr-only peer"
              // ensure blue accent for toggle input too
              style={{ accentColor: "#0ea5e9" }}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 rounded-full shadow-md transform transition-transform peer-checked:translate-x-5"></div>
          </label>
        ) : isSelect ? (
          <div className="relative" ref={selectWrapperRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={`w-full flex justify-between items-center border border-default rounded-custom-md bg-neutral-input text-gray-700 cursor-pointer  ${sizeClasses[size]
                } ${error ? "" : ""}`}
            >
              <span>
                {isMultiSelect ? (
                  Array.isArray(props.value) && props.value.length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                      {props.value.length === options.length
                        ? "All Selected"
                        : `${props.value.length} items selected`
                      }
                    </span>
                  ) : (
                    placeholder
                  )
                ) : (
                  options.find(
                    (opt) =>
                      opt.value ===
                      (props.value !== undefined ? props.value : selected)
                  )?.label || placeholder
                )}
              </span>
              <ChevronDown
                size={18}
                className={`ml-2 transform transition-transform ${open ? "rotate-180" : ""
                  }`}
              />
            </button>

            {open && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                  {options.map((opt, idx) => {
                    const currentValue =
                      props.value !== undefined ? props.value : selected;
                    return (
                      <li
                        key={idx}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${isMultiSelect
                            ? (Array.isArray(currentValue) && currentValue.includes(opt.value) ? "bg-blue-50 text-primary" : "text-gray-700")
                            : (currentValue === opt.value ? "bg-gray-100 text-neutral" : "text-gray-700")
                          }`}
                        onClick={() => {
                          if (opt.to) {
                            navigate(opt.to);
                            setOpen(false);
                          } else if (isMultiSelect) {
                            const currentValues = Array.isArray(props.value) ? props.value : [];
                            const newValues = currentValues.includes(opt.value)
                              ? currentValues.filter(v => v !== opt.value)
                              : [...currentValues, opt.value];

                            props.onChange?.({
                              target: { name: props.name, value: newValues },
                            });
                          } else {
                            setSelected(opt.value);
                            props.onChange?.({
                              target: { name: props.name, value: opt.value },
                            });
                            setOpen(false);
                          }
                        }}
                      >
                        {opt.label}
                        {isMultiSelect && Array.isArray(currentValue) && currentValue.includes(opt.value) && (
                          <span className="w-4 h-4 rounded border-2 border-primary bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ) : isTextArea ? (
          <textarea
            {...props}
            id={props.name}
            placeholder={placeholder}
            className={`w-full border rounded-custom-md bg-neutral-input text-gray-700 border-default resize-none focus:outline-none focus:ring-0 focus:border-default ${sizeClasses[size]
              } ${inputClassName} ${error ? "" : ""}`}
            rows={props.rows || 4}
          />
        ) : isRadio ? (
          <div
            className={`flex gap-4 ${props.direction === "column" ? "flex-col" : "flex-row"
              } ${props.className || ""}`}
          >
            {options.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={props.name}
                  value={opt.value}
                  checked={props.value === opt.value}
                  onChange={(e) =>
                    props.onChange?.({
                      target: { name: props.name, value: e.target.value },
                    })
                  }
                  className="h-4 w-4 border-gray-300 cursor-pointer"
                  style={{ accentColor: "#1B84FF" }}
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="relative">
            <input
              {...props}
              id={props.name}
              type={inputType}
              placeholder={placeholder}
              className={`w-full border border-default rounded-custom-md bg-neutral-input text-gray-700 focus:outline-none focus:ring-0 focus:border-default ${sizeClasses[size]
                } ${inputClassName} ${error ? "" : ""}`}
            />
            {type === "password" && (
              <img
                src={showPassword ? EyeOffIcon : EyeIcon}
                alt="Toggle Password"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
