import React from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

/**
 * DateTimePickerForModifyPost
 * - A single-file responsive DateTimePicker component tailored for the "ModifyPost" page scheduling field.
 * - Uses DesktopDateTimePicker on larger screens and MobileDateTimePicker on small screens.
 * - Works with Formik (pass `formik` + `name`) or as a controlled component with `value` and `onChange`.
 * - Stores dates as ISO strings when using Formik.
 *
 * Props:
 *  - formik: Formik instance (optional)
 *  - name: field name for Formik (default: "postStartTime")
 *  - label: label text (default: "Post Start Time")
 *  - placeholder: input placeholder
 *  - value: controlled value (ISO string or null)
 *  - onChange: controlled onChange (receives ISO string or null)
 */

export default function DateTimePickerForModifyPost({
  formik,
  name = "postStartTime",
  label = "Post Start Time",
  placeholder = "YYYY-MM-DD HH:mm:ss",
  value: controlledValue,
  onChange: controlledOnChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const rawValue = formik ? formik.values?.[name] : controlledValue;
  const parsedValue = rawValue ? dayjs(rawValue) : null;

  const handleChange = (newVal) => {
    if (!newVal || !newVal.isValid || !newVal.isValid()) {
      if (formik) formik.setFieldValue(name, null);
      if (controlledOnChange) controlledOnChange(null);
      return;
    }

    const iso = newVal.toISOString();
    if (formik) formik.setFieldValue(name, iso);
    if (controlledOnChange) controlledOnChange(iso);
  };

  const slotProps = {
    textField: {
      fullWidth: true,
      size: "small",
      placeholder,
      InputLabelProps: { shrink: true },
      helperText: formik?.touched?.[name] && formik?.errors?.[name] ? formik.errors[name] : "",
      error: Boolean(formik?.touched?.[name] && formik?.errors?.[name]),
    },
  };

  return (
    <div className="mb-4 max-w-full">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {isMobile ? (
          <MobileDateTimePicker value={parsedValue} onChange={handleChange} slotProps={slotProps} />
        ) : (
          <DesktopDateTimePicker value={parsedValue} onChange={handleChange} slotProps={slotProps} />
        )}
      </LocalizationProvider>

    </div>
  );
}

DateTimePickerForModifyPost.propTypes = {
  formik: PropTypes.object,
  name: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
};
