import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import CustomTextField from "../CustomTextField";
import editIcon from "../../assets/icons/edit-icon.svg";
import crossIcon from "../../assets/icons/cross-icon.svg";
import CustomButton from "../CustomButton";

const ViewReportPopup = ({
  isOpen,
  onClose,
  isEditMode: isEditModeProp = false,
  reportData = {},
  reportOptions = [],
  frequencyOptions = [],
  onSave,
}) => {
  if (!isOpen) return null;

  const {
    recipient: initialRecipient = "",
    mailCount: initialMailCount = "",
    frequency: initialFrequency = "",
    scheduleType: initialScheduleType = "frequency",
    reportValues: initialReportValues = [],
  } = reportData;

  const [selectedReports, setSelectedReports] = useState(initialReportValues);
  const [scheduleType, setScheduleType] = useState(initialScheduleType);
  const [recipient, setRecipient] = useState(initialRecipient);
  const [mailCount, setMailCount] = useState(initialMailCount);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [isEditMode, setIsEditMode] = useState(isEditModeProp);

  useEffect(() => {
    setSelectedReports(initialReportValues);
    setScheduleType(initialScheduleType);
    setRecipient(initialRecipient);
    setMailCount(initialMailCount);
    setFrequency(initialFrequency);
  }, [reportData]);

  const handleReportChange = (e) => {
    const selectedValue = e.target.value;
    const selectedOption = reportOptions.find(
      (opt) => opt.value === selectedValue
    );

    if (
      selectedOption &&
      !selectedReports.some((report) => report.value === selectedOption.value)
    ) {
      setSelectedReports([...selectedReports, selectedOption]);
    }
  };

  const handleRemoveReport = (value) => {
    setSelectedReports(
      selectedReports.filter((report) => report.value !== value)
    );
  };

  const handleSave = () => {
    const updatedReportData = {
      ...reportData,
      recipient,
      mailCount,
      frequency,
      scheduleType,
      reportValues: selectedReports,
    };
    if (onSave) onSave(updatedReportData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg relative  mx-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary-dark">
            {isEditMode ? "Edit Report" : "View Report"}
          </h2>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsEditMode(true)}
            >
              <img src={editIcon} alt="Edit" />
              <span className="text-secondary text-sm font-medium">
                Edit Report
              </span>
            </div>

            <button className="cursor-pointer pt-1" onClick={onClose}>
              <img src={crossIcon} alt="Close" />
            </button>
          </div>
        </div>

        {/* Report Select */}
        <CustomTextField
          label="Report"
          isSelect
          name="report"
          options={reportOptions}
          value=""
          placeholder="Select Report"
          onChange={isEditMode ? handleReportChange : () => {}}
          disabled={!isEditMode}
        />

        {/* Selected Report Tags */}
        {selectedReports.length > 0 && (
          <div className="flex flex-wrap gap-2 my-2">
            {selectedReports.map((report) => (
              <span
                key={report.value}
                className="flex items-center gap-1 bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-sm"
              >
                {report.label}
                {isEditMode && (
                  <span
                    onClick={() => handleRemoveReport(report.value)}
                    className="text-gray-600 hover:text-gray-900 p-0 min-w-0 h-auto bg-transparent"
                    ariaLabel={`Remove ${report.label}`}
                  >
                    {/* Add the icon inside the button */}
                    <X className="w-4 h-4" />
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Recipient Email */}
        <CustomTextField
          label="Recipients Email"
          name="email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={!isEditMode}
        />

        {/* Schedule Type Radios */}
        <div className="mb-4 border-t border-[#F1F1F4] pt-4">
          <div className="flex gap-4 mt-1">
            {/* Schedule Type - RADIO USING CustomTextField (same design) */}
            <CustomTextField
              label="Schedule Report"
              isRadio
              name="scheduleType"
              direction="row" // inline (horizontal)
              options={[
                { label: "Frequency", value: "frequency" },
                { label: "Schedule", value: "schedule" },
              ]}
              value={scheduleType}
              onChange={(e) => {
                // CustomTextField's isRadio forwards the native event
                if (isEditMode) setScheduleType(e.target.value);
              }}
              disabled={!isEditMode}
              className="mt-1" // optional spacing class to match your design
            />
          </div>
        </div>

        {/* Mail Count & Frequency */}
        <div className="flex gap-4">
          <CustomTextField
            label="Enter Mail Count"
            name="mailCount"
            value={mailCount}
            min={0}
            onChange={(e) => setMailCount(e.target.value)}
            type="number"
            disabled={!isEditMode}
          />

          <CustomTextField
            label="Frequency"
            isSelect
            name="frequency"
            value={frequency}
            options={frequencyOptions}
            onChange={(e) => setFrequency(e.target.value)}
            disabled={!isEditMode}
          />
        </div>

        {/* Save Button */}
        {isEditMode && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-2 bg-gradient-primary text-white rounded-xl hover:opacity-90 transition text-sm font-semibold cursor-pointer"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReportPopup;
