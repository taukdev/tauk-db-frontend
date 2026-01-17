import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchListImportStatsDropdown,
  generateListImportStatsReport,
  setSearchQuery,
  setStartDate,
  setEndDate,
  setShowPanel,
  addSelectedList,
  removeSelectedList,
  setSelectedLists,
  clearSelectedLists,
} from "../../features/reports/ListImportStateSlice";
import { Plus, Search } from "lucide-react";
import ReportSearch from "../../assets/report-search.svg";
import DatePickerField from "../DatePickerField";
import crossIcon from "../../assets/icons/cross-icon.svg";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import CustomButton from "../CustomButton";
import Checkbox from "../common/Checkbox";
import CustomTextField from "../CustomTextField";

const ListImportState = () => {
  const dispatch = useDispatch();
  const {
    startDate,
    endDate,
    showPanel,
    selectedLists,
    data,
    loading,
    error,
    searchQuery,
    dropdownOptions,
    dropdownLoading,
    dropdownError,
    reportData,
    reportLoading,
    reportError,
  } = useSelector((state) => state.listImportStates);

  // local state for the "Show Daily Breakdown" checkbox
  const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);
  const [importThrough, setImportThrough] = useState("CSV");

  // Fetch dropdown data on mount
  useEffect(() => {
    dispatch(fetchListImportStatsDropdown());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Reports", path: "/report" },
        { label: "List Import Status", path: "/report/list-import-status" },
      ])
    );
  }, [dispatch]);

  // Format dropdown options for display (format: "id - name")
  const pickListOptions = dropdownOptions
    .map((list) => {
      if (typeof list === 'string') return list;
      // Use display field if available, otherwise format manually
      if (list.display) return list.display;
      return `${list.id} - ${list.name || list.list_name || ''}`;
    })
    .filter((option) => {
      // Filter by search query if provided
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return option.toLowerCase().includes(query);
    });

  // Store list IDs for API call
  const selectedListIds = selectedLists.map((item) => {
    // Extract ID from formatted string "id - name" or use item directly if it's already an ID
    if (typeof item === 'number') return item;
    const match = item.match(/^(\d+)\s*-/);
    return match ? parseInt(match[1]) : null;
  }).filter(Boolean);

  const handleSelect = (item) => {
    if (!selectedLists.includes(item)) dispatch(addSelectedList(item));
  };

  const handleDeselect = (item) => {
    dispatch(removeSelectedList(item));
  };

  const handleSelectAll = () =>
    dispatch(setSelectedLists(pickListOptions.slice()));
  const handleDeselectAll = () => dispatch(clearSelectedLists());

  const handleRunReport = () => {
    if (selectedListIds.length === 0) {
      alert('Please select at least one list');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const payload = {
      list_ids: selectedListIds,
      start_date: startDate,
      end_date: endDate,
    };

    // Add optional parameters
    if (showDailyBreakdown) {
      payload.show_daily_breakdown = true;
    }

    if (importThrough && importThrough !== 'Both') {
      payload.import_through = importThrough;
    }

    dispatch(generateListImportStatsReport(payload));
  };

  const filteredData = data.filter((report) =>
    report.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="text-primary-dark font-bold text-sm sm:text-md mb-3">
        <h2 className="text-lg sm:text-xl text-primary-dark font-medium">
          List Import States
        </h2>
      </div>

      {/* Card Wrapper */}
      <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-3 sm:p-4 md:p-6">
        {/* Card Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 border-b border-[#F1F1F4] pb-3 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
          <h2 className="text-sm sm:text-md font-semibold text-primary-dark">
            List Import States
          </h2>

          {/* Filters */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search lists by name or ID"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 font-bold uppercase">TOTAL LEADS</p>
                    <p className="text-lg sm:text-xl font-bold text-primary-dark">
                      {reportData.summary.total_leads || reportData.summary.total_records || reportData.summary.total_imports || 0}
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 font-bold uppercase">TOTAL Abandons</p>
                    <p className="text-lg sm:text-xl font-bold text-primary-dark">
                      {reportData.summary.total_abandons || reportData.summary.abandons || 0}
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 font-bold">Total Buyers</p>
                    <p className="text-lg sm:text-xl font-bold text-primary-dark">
                      {reportData.summary.total_buyers || reportData.summary.buyers || 0}
                    </p>
                  </div>
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

            {/* By List Section */}
            {reportData.by_list && reportData.by_list.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
                  By List
                </h3>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {reportData.by_list.map((list, index) => (
                    <div
                      key={list.list_id || index}
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                    >
                      <h4 className="font-semibold text-primary-dark mb-3 text-sm sm:text-base">
                        {list.list_name || `List ${list.list_id}`}
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase font-bold">LEADS</p>
                          <p className="text-sm font-semibold text-primary-dark">
                            {list.total_leads || list.total_records || list.total_imports || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase font-bold">Abandons</p>
                          <p className="text-sm font-semibold text-primary-dark">
                            {list.total_abandons || list.abandons || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase font-bold">Buyers</p>
                          <p className="text-sm font-semibold text-primary-dark">
                            {list.total_buyers || list.buyers || 0}
                          </p>
                        </div>
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
                          List Name
                        </th>
                        <th className="px-3 sm:px-4 py-2 text-left border border-gray-200 text-xs sm:text-sm font-bold uppercase">
                          TOTAL LEADS
                        </th>
                        <th className="px-3 sm:px-4 py-2 text-left border border-gray-200 text-xs sm:text-sm font-bold uppercase">
                          TOTAL Abandons
                        </th>
                        <th className="px-3 sm:px-4 py-2 text-left border border-gray-200 text-xs sm:text-sm font-bold uppercase">
                          Total Buyers
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.by_list.map((list, index) => (
                        <tr key={list.list_id || index} className="bg-white">
                          <td className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                            {list.list_name || `List ${list.list_id}`}
                          </td>
                          <td className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                            {list.total_leads || list.total_records || list.total_imports || 0}
                          </td>
                          <td className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                            {list.total_abandons || list.abandons || 0}
                          </td>
                          <td className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                            {list.total_buyers || list.buyers || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Daily Breakdown Section */}
            {reportData.daily_breakdown &&
              reportData.daily_breakdown.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
                    Daily Breakdown
                  </h3>
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-3">
                    {reportData.daily_breakdown.map((day, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-primary-dark text-sm sm:text-base">
                            {day.date}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-600">Imports</p>
                            <p className="text-sm font-semibold text-primary-dark">
                              {day.imports || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Records</p>
                            <p className="text-sm font-semibold text-primary-dark">
                              {day.records || 0}
                            </p>
                          </div>
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
                            Date
                          </th>
                          <th className="px-3 sm:px-4 py-2 text-left border border-gray-200 text-xs sm:text-sm font-medium">
                            Imports
                          </th>
                          <th className="px-3 sm:px-4 py-2 text-left border border-gray-200 text-xs sm:text-sm font-medium">
                            Records
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.daily_breakdown.map((day, index) => (
                          <tr key={index} className="bg-white">
                            <td className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                              {day.date}
                            </td>
                            <td className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                              {day.imports || 0}
                            </td>
                            <td className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                              {day.records || 0}
                            </td>
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

      {/* Overlay & Right-side search panel */}
      {showPanel && (
        <>
          {/* Overlay */}
          {/* Dimmed overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => dispatch(setShowPanel(false))}
          />

          {/* Right-side Panel */}
          <div className="fixed inset-0 m-3 sm:m-6 lg:m-0 rounded-custom-lg lg:inset-auto lg:right-6 lg:top-6 lg:bottom-6 lg:min-w-[720px] bg-white shadow-xl border border-[#E1E3EA] lg:rounded-xl z-50 overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#F1F1F4]">
              <h2 className="text-primary-dark text-[16px]">Filter</h2>
              <button
                onClick={() => dispatch(setShowPanel(false))}
                className="text-gray-400 cursor-pointer text-xl p-1"
              >
                <img src={crossIcon} alt="Close" />
              </button>
            </div>
            <div className="px-4 lg:px-8 py-3 h-full">
              <div>
                <h3 className="text-primary-dark text-sm">Select Lists</h3>
                <div className="relative w-full mt-4">
                  <input
                    type="text"
                    placeholder="Search lists by name or ID"
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Pick list selectors */}
              <div className="mt-4 py-0">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-0">
                  <div className="flex-1">
                    <label className="text-sm text-primary-dark font-medium mb-2 block">
                      Pick lists
                    </label>
                    <div className="rounded-[8px] overflow-hidden bg-neutral-input border border-secondary-lighter h-40">
                      <div className="h-full overflow-y-auto custom-scrollbar p-2 sm:p-3">
                        <ul className="divide-y divide-gray-100">
                          {dropdownLoading ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400">
                              Loading lists...
                            </li>
                          ) : dropdownError ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500">
                              Error loading lists: {dropdownError}
                            </li>
                          ) : pickListOptions.length === 0 ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400">
                              No lists available
                            </li>
                          ) : (
                            pickListOptions
                              .filter((i) => !selectedLists.includes(i))
                              .map((item) => (
                                <li
                                  key={item}
                                  className="px-3 sm:px-4 text-xs sm:text-[13px] py-2 cursor-pointer hover:bg-[#F5F7F9] hover:text-bold hover:rounded-[6px] break-words"
                                  onClick={() => handleSelect(item)}
                                >
                                  {item}
                                </li>
                              ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm text-neutral font-medium mb-2 block">
                      You have selected
                    </label>
                    <div className="rounded-[8px] overflow-hidden bg-neutral-input border border-secondary-lighter h-40">
                      <div className="h-full overflow-y-auto custom-scrollbar p-2 sm:p-3">
                        <ul className="divide-y divide-gray-100">
                          {selectedLists.length === 0 ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400">
                              No lists selected
                            </li>
                          ) : (
                            selectedLists.map((item) => (
                              <li
                                key={item}
                                className="px-3 sm:px-4 text-xs sm:text-[13px] py-2 cursor-pointer hover:bg-[#F5F7F9] break-words"
                                onClick={() => handleDeselect(item)}
                              >
                                {item}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3 text-xs sm:text-[13px] text-center md:text-start">
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
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 my-4 sm:my-5">
                <label className="text-xs sm:text-sm text-neutral w-full sm:w-40 flex-shrink-0">Start Date</label>
                <div className="flex-1">
                  <DatePickerField
                    label="Start Date"
                    value={startDate}
                    onChange={(val) => dispatch(setStartDate(val))}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 my-4 sm:my-5">
                <label className="text-xs sm:text-sm text-neutral w-full sm:w-40 flex-shrink-0">End Date</label>
                <div className="flex-1">
                  <DatePickerField
                    label="End Date"
                    value={endDate}
                    onChange={(val) => dispatch(setEndDate(val))}
                  />
                </div>
              </div>

              <div className="my-4 sm:my-5">
                <label className="inline-flex items-center gap-2">
                  <Checkbox
                    checked={showDailyBreakdown}
                    onChange={(e) => setShowDailyBreakdown(e.target.checked)}
                    checkboxSize="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    Show Daily Breakdown
                  </span>
                </label>
              </div>

              {/* === REPLACED: use CustomTextField isRadio instead of raw inputs === */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <div className="text-xs sm:text-sm mb-0 sm:mb-2 w-full sm:w-auto">Import Through</div>
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <CustomTextField
                    name="importThrough"
                    isRadio
                    options={[
                      { label: "CSV", value: "CSV" },
                      { label: "Webhook", value: "Webhook" },
                      { label: "Both", value: "Both" },
                    ]}
                    value={importThrough}
                    onChange={(e) => setImportThrough(e.target.value)}
                    direction="row"
                    className="!mb-0"
                  />
                </div>
              </div>

              <CustomButton
                position="end"
                className="mt-6 sm:mt-8 px-3 mb-4 w-full sm:w-auto"
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

export default ListImportState;
