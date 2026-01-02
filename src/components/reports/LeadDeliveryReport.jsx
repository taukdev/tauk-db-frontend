import React, { useEffect, useState } from "react";
import ReportSearch from "../../assets/report-search.svg";
import crossIcon from "../../assets/icons/cross-icon.svg";
import CustomTextField from "../CustomTextField"; // path as per your project


import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeadDeliveryDropdown,
  generateLeadDeliveryReport,
  setSearchQuery,
  setShowPanel,
  setStartDate,
  setEndDate,
  addSelectedPlatform,
  removeSelectedPlatform,
  setSelectedPlatforms,
  clearSelectedPlatforms,
  setLeadType,
  setSubtractReturnedLeads,
} from "../../features/reports/LeadDeliveryReportSlice";
import { Plus, Search, X } from "lucide-react";
import DatePickerField from "../DatePickerField";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import CustomButton from "../CustomButton";
import SearchBox from "../SearchBox";

// <-- shared Checkbox import (adjust path if needed)
import Checkbox from "../common/Checkbox";

const LeadDeliveryReport = () => {
  const dispatch = useDispatch();
  const [validationErrors, setValidationErrors] = useState({
    platforms: '',
    dates: '',
  });

  const {
    searchQuery,
    showPanel,
    startDate,
    endDate,
    selectedPlatforms,
    platforms,
    leadType,
    subtractReturnedLeads,
    dropdownLoading,
    dropdownError,
    reportData,
    reportLoading,
    reportError,
  } = useSelector((state) => state.leadDeliveryReport);

  // Fetch dropdown data on mount
  useEffect(() => {
    dispatch(fetchLeadDeliveryDropdown());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Reports", path: "/report" },
        { label: "Lead Delivery Report", path: "/report/lead-delivery-report" },
      ])
    );
  }, [dispatch]);

  // Format dropdown options for display (format: "id - name")
  const platformOptions = platforms
    .map((platform) => {
      if (typeof platform === 'string') return platform;
      // Use display field if available, otherwise format manually
      if (platform.display) return platform.display;
      return `${platform.id} - ${platform.name || platform.platform_name || ''}`;
    })
    .filter((option) => {
      // Filter by search query if provided
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return option.toLowerCase().includes(query);
    });

  // Store platform IDs for API call - need to match selected strings with platform objects
  const selectedPlatformIds = selectedPlatforms.map((selectedItem) => {
    // Find the platform object that matches the selected string
    const platform = platforms.find((p) => {
      if (typeof p === 'string') return p === selectedItem;
      const display = p.display || `${p.id} - ${p.name || p.platform_name || ''}`;
      return display === selectedItem;
    });
    
    if (platform && typeof platform === 'object' && platform.id) {
      return platform.id;
    }
    
    // Fallback: try to extract ID from formatted string "id - name"
    if (typeof selectedItem === 'number') return selectedItem;
    const match = selectedItem.match(/^(\d+)\s*-/);
    if (match) {
      return parseInt(match[1]);
    }
    
    return null;
  }).filter((id) => id !== null && id !== undefined);

  const handleSelect = (platform) => {
    if (!selectedPlatforms.includes(platform)) {
      dispatch(addSelectedPlatform(platform));
      // Clear platform error when user selects a platform
      if (validationErrors.platforms) {
        setValidationErrors(prev => ({ ...prev, platforms: '' }));
      }
    }
  };

  const handleDeselect = (platform) => {
    dispatch(removeSelectedPlatform(platform));
  };

  const handleSelectAll = () => dispatch(setSelectedPlatforms(platformOptions.slice()));
  const handleDeselectAll = () => dispatch(clearSelectedPlatforms());

  const handleRunReport = () => {
    // Clear previous errors
    setValidationErrors({ platforms: '', dates: '' });

    // Validate platforms
    if (selectedPlatforms.length === 0) {
      setValidationErrors(prev => ({
        ...prev,
        platforms: 'Please select at least one platform'
      }));
      return;
    }

    // Validate dates
    if (!startDate || !endDate) {
      setValidationErrors(prev => ({
        ...prev,
        dates: 'Please select both start and end dates'
      }));
      return;
    }

    // Check if we have valid platform IDs
    if (selectedPlatformIds.length === 0) {
      setValidationErrors(prev => ({
        ...prev,
        platforms: 'Unable to extract platform IDs. Please try selecting platforms again.'
      }));
      return;
    }

    const payload = {
      platform_ids: selectedPlatformIds,
      start_date: startDate,
      end_date: endDate,
      leads_type: leadType,
    };

    // Add optional parameter
    if (subtractReturnedLeads) {
      payload.subtract_returned_leads = true;
    }

    dispatch(generateLeadDeliveryReport(payload));
  };

  return (
    <div>
      {/* Header */}
      <div className="text-primary-dark font-bold text-md mb-3">
        <h2 className="text-xl text-primary-dark font-medium">
          Lead Delivery Report
        </h2>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-3 sm:p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 border-b border-[#F1F1F4] pb-3 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
          <h2 className="text-md font-semibold text-primary-dark">
            Lead Delivery Report
          </h2>

          {/* filters */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search lists by name or ID"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm  focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => dispatch(setShowPanel(true))}
              className="flex items-center justify-center sm:justify-start w-full sm:w-auto text-primary px-3 py-1 gap-1 border border-[#1B84FF33] rounded-[6px] bg-[#EFF6FF] cursor-pointer"
            >
              <Plus color="#1b84ff" />
              <span className="whitespace-nowrap">Search Report</span>
            </button>
          </div>
        </div>

        {/* Report Results or Empty state */}
        {reportLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[550px] text-center p-4 sm:p-6">
            <p className="text-base sm:text-lg text-[#4B5563] max-w-md font-medium px-4">
              Generating report...
            </p>
          </div>
        ) : reportError ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[550px] text-center p-4 sm:p-6">
            <p className="text-base sm:text-lg text-red-500 max-w-md font-medium px-4">
              Error: {reportError}
            </p>
          </div>
        ) : reportData ? (
          <div className="p-3 sm:p-4 md:p-6">
            {/* Summary Section */}
            {reportData.summary && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
                  Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(reportData.summary).map(([key, value]) => {
                    if (key === 'date_range' || typeof value === 'object') return null;
                    return (
                      <div key={key} className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-primary-dark">
                          {value || 0}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {reportData.summary.date_range && (
                  <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 break-words">
                    <p>
                      <span className="font-medium">Date Range:</span>{' '}
                      <span className="block sm:inline">{reportData.summary.date_range.start}</span>
                      {' '}to{' '}
                      <span className="block sm:inline">{reportData.summary.date_range.end}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* By Platform Section */}
            {reportData.by_platform && reportData.by_platform.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
                  By Platform
                </h3>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {reportData.by_platform.map((platform, index) => (
                    <div
                      key={platform.platform_id || index}
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                    >
                      <h4 className="font-semibold text-primary-dark mb-3 text-sm sm:text-base">
                        {platform.platform_name || `Platform ${platform.platform_id}`}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(platform).map(([key, value]) => {
                          if (key === 'platform_id' || key === 'platform_name' || typeof value === 'object') return null;
                          return (
                            <div key={key}>
                              <p className="text-xs text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm font-semibold text-primary-dark">
                                {value || 0}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 text-left border border-gray-200 text-xs sm:text-sm font-medium">
                          Platform Name
                        </th>
                        {reportData.by_platform[0] && Object.keys(reportData.by_platform[0])
                          .filter(key => key !== 'platform_id' && key !== 'platform_name' && typeof reportData.by_platform[0][key] !== 'object')
                          .map((key) => (
                            <th key={key} className="px-3 sm:px-4 py-2 text-left border border-gray-200 text-xs sm:text-sm font-medium capitalize">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.by_platform.map((platform, index) => (
                        <tr key={platform.platform_id || index} className="bg-white">
                          <td className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                            {platform.platform_name || `Platform ${platform.platform_id}`}
                          </td>
                          {Object.entries(platform)
                            .filter(([key]) => key !== 'platform_id' && key !== 'platform_name' && typeof platform[key] !== 'object')
                            .map(([key, value]) => (
                              <td key={key} className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                                {value || 0}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[550px] text-center p-4 sm:p-6">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <img src={ReportSearch} alt="Search" className="w-32 sm:w-auto" />
            </div>
            <p className="text-base sm:text-lg text-[#4B5563] max-w-md font-medium px-4">
              No report found.
            </p>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => dispatch(setShowPanel(false))}
          />

          {/* Panel */}
          <div className="fixed lg:min-w-[720px] m-6 lg:m-0 rounded-custom-lg inset-0 lg:inset-auto lg:right-6 lg:top-6 lg:bottom-6 lg:w-[480px] bg-white shadow-xl border border-[#E1E3EA] lg:rounded-xl z-50 overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#F1F1F4]">
              <h2 className="text-primary-dark text-[16px] font-medium">
                Filter
              </h2>
              <button
                onClick={() => dispatch(setShowPanel(false))}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <img src={crossIcon} alt="Close" />
              </button>
            </div>

            <div className="p-6 h-[calc(100%-64px)]">
              {/* Platform Selection */}
              <div className="mb-6">
                <h3 className="text-primary-dark text-sm font-medium mb-3">
                  Select Platforms
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search lists by name or ID"
                      value={searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                      className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  <h4 className="text-sm text-neutral font-medium mb-2 w-full">
                    You have selected
                  </h4>
                </div>

                <div className="flex gap-3 justify-between">
                  {/* Available Platforms */}
                  <div className="mt-3 w-full">
                    <div className="rounded-lg border border-separator overflow-hidden">
                      <div className="h-48 overflow-y-auto bg-neutral-input">
                        <ul className="divide-y divide-gray-100">
                          {dropdownLoading ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400">
                              Loading platforms...
                            </li>
                          ) : dropdownError ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500">
                              Error loading platforms: {dropdownError}
                            </li>
                          ) : platformOptions.length === 0 ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400">
                              No platforms available
                            </li>
                          ) : (
                            platformOptions
                              .filter((p) => !selectedPlatforms.includes(p))
                              .map((platform) => (
                                <li
                                  key={platform}
                                  className="px-3 sm:px-4 text-xs sm:text-sm py-2 cursor-pointer hover:bg-[#F5F7F9] break-words"
                                  onClick={() => handleSelect(platform)}
                                >
                                  {platform}
                                </li>
                              ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Selected Platforms */}
                  <div className="mt-3 w-full">
                    <div className="rounded-lg border border-separator overflow-hidden">
                      <div className="h-48 overflow-y-auto bg-neutral-input">
                        <ul className="divide-y divide-gray-100">
                          {selectedPlatforms.length === 0 ? (
                            <li className="px-4 py-2 text-sm text-gray-400">
                              No platforms selected
                            </li>
                          ) : (
                            selectedPlatforms.map((platform) => (
                              <li
                                key={platform}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F7F9] flex items-center justify-between"
                                onClick={() => handleDeselect(platform)}
                              >
                                {platform}
                                <X className="h-4 w-4 text-gray-400" />
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[13px] text-start">
                  <button
                    type="button"
                    className="text-primary underline decoration-dashed underline-offset-4 mr-2 cursor-pointer"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </button>
                  /
                  <button
                    type="button"
                    className="text-primary underline decoration-dashed underline-offset-4 ml-2 cursor-pointer"
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </button>
                </div>
                {/* Platform Validation Error */}
                {validationErrors.platforms && (
                  <div className="mt-2 text-xs text-red-500">
                    {validationErrors.platforms}
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label className="text-xs sm:text-sm text-neutral w-full sm:w-24 flex-shrink-0">
                    Start Date
                  </label>
                  <div className="flex-1">
                    <DatePickerField
                      label="Start Date"
                      value={startDate}
                      onChange={(val) => {
                        dispatch(setStartDate(val));
                        // Clear date error when user selects a date
                        if (val) {
                          setValidationErrors(prev => ({ ...prev, dates: '' }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label className="text-xs sm:text-sm text-neutral w-full sm:w-24 flex-shrink-0">End Date</label>
                  <div className="flex-1">
                    <DatePickerField
                      label="End Date"
                      value={endDate}
                      onChange={(val) => {
                        dispatch(setEndDate(val));
                        // Clear date error when user selects a date
                        if (val) {
                          setValidationErrors(prev => ({ ...prev, dates: '' }));
                        }
                      }}
                    />
                  </div>
                </div>
                {/* Date Validation Error */}
                {validationErrors.dates && (
                  <div className="text-xs text-red-500">
                    {validationErrors.dates}
                  </div>
                )}
              </div>

              {/* Lead Type */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <label className="text-xs sm:text-sm text-neutral block mb-0 sm:mb-2 w-full sm:w-24 flex-shrink-0">
                  Leads Type
                </label>

                <div className="relative w-full flex-1">
                  <CustomTextField
                    name="leadType"
                    isSelect
                    placeholder="Select Lead Type"
                    options={[
                      { label: "Abandons Leads", value: "Abandons Leads" },
                      { label: "Buyers Leads", value: "Buyers Leads" },
                      { label: "Declines Leads", value: "Declines Leads" },
                    ]}
                    value={leadType}
                    onChange={(e) => dispatch(setLeadType(e.target.value))}
                    size="sm"
                  />
                </div>
              </div>


              {/* Subtract Returned Leads */}
              <div className="mb-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={subtractReturnedLeads}
                    onChange={(e) =>
                      dispatch(setSubtractReturnedLeads(e.target.checked))
                    }
                    checkboxSize="w-4 h-4"
                  />
                  <span className="text-sm font-medium">
                    Subtract returned leads (Please only check this field if
                    your buyers have the option of returning leads. Leaving it
                    unchecked will significantly speed up your reporting)
                  </span>
                </label>
              </div>

              {/* Run Report Button */}
              <CustomButton
                className="mt-10 mb-6 w-full sm:w-auto"
                onClick={handleRunReport}
                disabled={reportLoading}
              >
                {reportLoading ? 'Generating...' : 'Run Report'}
              </CustomButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeadDeliveryReport;
