import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReportSearch from "../../assets/report-search.svg";
import { Search, Plus } from "lucide-react";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import DatePickerField from "../DatePickerField";
import {
  generateScrubReport,
  setSearchText,
  toggleFilter,
  setStartDate,
  setEndDate,
  selectScrubReport,
} from "../../features/reports/ScrubReportSlice.jsx";
import crossIcon from "../../assets/icons/cross-icon.svg";
import CustomButton from "../CustomButton.jsx";

const ScrubReport = () => {
  const dispatch = useDispatch();
  const [validationErrors, setValidationErrors] = useState({
    dates: '',
  });

  const { searchText, showFilter, startDate, endDate, reportData, reportLoading, reportError } =
    useSelector(selectScrubReport);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Reports", path: "/report" },
        { label: "Scrub Report", path: "/report/scrub-report" },
      ])
    );
  }, [dispatch]);

  const handleSearchChange = (e) => {
    dispatch(setSearchText(e.target.value));
  };

  const handleSearchClick = () => {
    dispatch(toggleFilter());
  };

  const handleRunReport = () => {
    // Clear previous errors
    setValidationErrors({ dates: '' });

    // Validate dates
    if (!startDate || !endDate) {
      setValidationErrors({
        dates: 'Please select both start and end dates'
      });
      return;
    }

    const payload = {
      start_date: startDate,
      end_date: endDate,
    };

    dispatch(generateScrubReport(payload));
  };

  return (
    <div>
      <div className="text-primary-dark font-bold text-sm sm:text-md mb-3">
        <h2 className="text-lg sm:text-xl text-primary-dark font-medium">Scrub Report</h2>
      </div>

      {/* Card Wrapper */}
      <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-3 sm:p-4 md:p-6">
        {/* Card Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 border-b border-[#F1F1F4] pb-3 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
          <h2 className="text-sm sm:text-md font-semibold text-primary-dark">
            Scrub Report
          </h2>

          {/* Filters */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search lists by name or ID"
                value={searchText}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <button
              onClick={() => dispatch(toggleFilter())}
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

            {/* Data Table */}
            {reportData.data && reportData.data.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
                  Report Data
                </h3>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {reportData.data.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                    >
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key} className="mb-2 last:mb-0">
                          <p className="text-xs text-gray-600 capitalize mb-1">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm font-semibold text-primary-dark">
                            {value || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportData.data[0] && Object.keys(reportData.data[0]).map((key) => (
                          <th key={key} className="px-3 sm:px-4 py-2 text-left border border-gray-200 text-xs sm:text-sm font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((item, index) => (
                        <tr key={index} className="bg-white">
                          {Object.entries(item).map(([key, value]) => (
                            <td key={key} className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm">
                              {value || '-'}
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

        {/* Filter Panel */}
        {showFilter && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => dispatch(toggleFilter())}
            />
            <div className="fixed inset-0 m-3 sm:m-6 lg:m-0 rounded-custom-lg lg:inset-auto lg:right-6 lg:top-6 lg:bottom-6 lg:min-w-[720px] bg-white shadow-xl border border-[#E1E3EA] lg:rounded-xl z-50 overflow-auto">
              <div className="flex justify-between items-center p-4 border-b border-[#F1F1F4]">
                <h2 className="text-primary-dark text-[16px] font-semibold">
                  Filter
                </h2>
                <button
                  onClick={() => dispatch(toggleFilter())}
                  className="text-gray-400 cursor-pointer text-xl p-1"
                >
                  <img src={crossIcon} alt="Close" />
                </button>
              </div>

              <div className="px-4 lg:px-8 py-3 overflow-auto max-h-[calc(100vh-100px)]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 my-4 sm:my-5">
                  <label className="text-xs sm:text-sm text-neutral w-full sm:w-40 flex-shrink-0">
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 my-4 sm:my-5">
                  <label className="text-xs sm:text-sm text-neutral w-full sm:w-40 flex-shrink-0">End Date</label>
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
                  <div className="text-xs text-red-500 mb-4">
                    {validationErrors.dates}
                  </div>
                )}

                <CustomButton
                  className="mt-6 sm:mt-8 w-full sm:w-auto"
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
    </div>
  );
};

export default ScrubReport;
