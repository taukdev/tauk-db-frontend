import React, { useMemo, useState, useEffect, useRef } from "react";
import CalendarIcon from "../assets/icons/calendar.svg";
import dayjs from "dayjs";

import TextField from "@mui/material/TextField";
import {
  DatePicker,
  MobileDatePicker,
  DesktopDatePicker,
} from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function DatePickerField({
  label = "Select Date",
  value,
  onChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(value ? dayjs(value) : null);

  const anchorRef = useRef(null);

  useEffect(() => {
    setSelectedDay(value ? dayjs(value) : null);
  }, [value]);

  const formattedDate = useMemo(() => {
    if (!selectedDay?.isValid()) return "";
    return selectedDay.format("MMM DD, YYYY");
  }, [selectedDay]);

  const handleChange = (newValue) => {
    setSelectedDay(newValue);
    if (newValue?.isValid()) onChange?.(newValue.format("YYYY-MM-DD"));
    else onChange?.(null);
    setOpen(false);
  };

  const commonProps = {
    open,
    onClose: () => setOpen(false),
    value: selectedDay,
    onChange: handleChange,
    renderInput: (params) => (
      <TextField
        {...params}
        sx={{
          width: 0,
          height: 0,
          visibility: "hidden",
          position: "absolute",
          pointerEvents: "none",
        }}
      />
    ),
  };

  // ⭐ FIX: Popper never goes outside & stays responsive
  const popperProps = {
    PopperProps: {
      anchorEl: anchorRef.current,
      modifiers: [
        { name: "preventOverflow", options: { boundary: "viewport" } },
        { name: "flip", enabled: true },
        { name: "offset", options: { offset: [0, 10] } },
        {
          name: "sameWidth",
          enabled: true,
          fn: ({ state }) => {
            state.styles.popper.width = `${state.rects.reference.width}px`;
          },
          phase: "beforeWrite",
          requires: ["computeStyles"],
        },
      ],
    },
  };

  const renderPicker = () => {
    if (isMobile) return <MobileDatePicker {...commonProps} />;

    if (isDesktop)
      return <DesktopDatePicker {...commonProps} {...popperProps} />;

    return <DatePicker {...commonProps} {...popperProps} />;
  };

  return (
    <div className="w-full relative">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer w-full items-center gap-2 rounded-[6px] border border-[#D7DFE9] bg-neutral-input px-2 py-1.5"
      >
        <img src={CalendarIcon} alt="calendar" className="h-5 w-5" />
        <span className={formattedDate ? "text-[#0F172A]" : "text-[#6B7280]"}>
          {formattedDate || label}
        </span>

        <svg
          className="ml-auto h-4 w-4 text-[#9CA3AF]"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div aria-hidden className="absolute h-0 w-0 opacity-0 pointer-events-none">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {renderPicker()}
        </LocalizationProvider>
      </div>
    </div>
  );
}
