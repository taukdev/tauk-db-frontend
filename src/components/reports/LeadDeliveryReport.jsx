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
  addSelectedVendor,
  removeSelectedVendor,
  setSelectedVendors,
  clearSelectedVendors,
  addSelectedList,
  removeSelectedList,
  setSelectedLists,
  clearSelectedLists,
  setSubtractReturnedLeads,
} from "../../features/reports/LeadDeliveryReportSlice";
import { Calendar, ChevronDown, ChevronRight, Plus, Search, Users, X } from "lucide-react";
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

  const [expandedRows, setExpandedRows] = useState({}); // { [listId_platformId]: boolean }
  const [expandedLists, setExpandedLists] = useState({}); // { [listId]: boolean }
  const [activeVendorId, setActiveVendorId] = useState(null);



  const toggleRow = (listId, platformId) => {
    const key = `${listId}_${platformId}`;
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleList = (listId) => {
    setExpandedLists(prev => ({
      ...prev,
      [listId]: !prev[listId]
    }));
  };

  const groupDataByPlatform = (actualData) => {
    if (!actualData || !Array.isArray(actualData)) return [];

    const groups = {};
    actualData.forEach(item => {
      const pId = item.platform_id;
      if (!groups[pId]) {
        groups[pId] = {
          platform_id: pId,
          platform_name: item.platform_name,
          attempts: []
        };
      }
      groups[pId].attempts.push(item);
    });

    return Object.values(groups).sort((a, b) => b.attempts.length - a.attempts.length);
  };

  const {
    searchQuery,
    showPanel,
    startDate,
    endDate,
    selectedVendors,
    selectedLists,
    vendors,
    lists,
    subtractReturnedLeads,
    dropdownLoading,
    dropdownError,
    reportData,
    reportLoading,
    reportError,
  } = useSelector((state) => state.leadDeliveryReport);

  // Initialize active vendor when report data arrives
  useEffect(() => {
    if (reportData?.vendors?.length > 0 && !activeVendorId) {
      setActiveVendorId(reportData.vendors[0].vendor_id);
    }
  }, [reportData, activeVendorId]);

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

  // Fetch lists whenever selected vendors change
  useEffect(() => {
    if (selectedVendors.length > 0) {
      const vendorIds = selectedVendors.join(',');

      dispatch(fetchLeadDeliveryDropdown({ vendor_ids: vendorIds }));
    } else {
      // If no vendors selected, don't show any lists
      dispatch(clearSelectedLists());
    }
  }, [dispatch, selectedVendors]);

  // Sync effect: Remove selected lists that are no longer in the available lists
  // This happens when a vendor is deselected and its lists are no longer fetched
  useEffect(() => {
    if (lists.length > 0 && selectedLists.length > 0) {
      const availableListIds = lists.map(l => l.id);
      const filteredSelectedLists = selectedLists.filter(sid => availableListIds.includes(sid));

      if (filteredSelectedLists.length !== selectedLists.length) {
        dispatch(setSelectedLists(filteredSelectedLists));
      }
    }
  }, [dispatch, lists, selectedLists]);

  const handleSelectVendor = (vendorId) => {
    if (!selectedVendors.includes(vendorId)) {
      dispatch(addSelectedVendor(vendorId));
    }
  };

  const handleDeselectVendor = (vendorId) => {
    dispatch(removeSelectedVendor(vendorId));
  };

  const handleSelectAllVendors = () => {
    const allVendorIds = vendors.map(v => v.id);
    dispatch(setSelectedVendors(allVendorIds));
  };

  const handleDeselectAllVendors = () => dispatch(clearSelectedVendors());

  const handleSelectList = (listId) => {
    if (!selectedLists.includes(listId)) {
      dispatch(addSelectedList(listId));
    }
  };

  const handleDeselectList = (listId) => {
    dispatch(removeSelectedList(listId));
  };

  const handleSelectAllLists = () => {
    const allListIds = lists.map(l => l.id);
    dispatch(setSelectedLists(allListIds));
  };

  const handleDeselectAllLists = () => dispatch(clearSelectedLists());

  const handleRunReport = () => {
    // Clear previous errors
    setValidationErrors({ vendors: '', dates: '' });

    // Validate vendors
    if (selectedVendors.length === 0) {
      setValidationErrors(prev => ({
        ...prev,
        vendors: 'Please select at least one vendor'
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

    const payload = {
      vendor_ids: selectedVendors,
      list_ids: selectedLists,
      start_date: startDate,
      end_date: endDate,
    };

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
          <div className="">
            {/* Summary Section */}
            {reportData.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
           
                {/* <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-subtle flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Total Leads Collected</p>
                    <p className="text-2xl font-black text-primary-dark leading-none mt-1">
                      {(reportData.summary.total_leads_collected || 0).toLocaleString()}
                    </p>
                  </div>
                </div> */}

                {/* Date Range Card */}
                {/* <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-subtle flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Reporting Period</p>
                    <p className="text-sm font-bold text-primary-dark mt-1">
                      {reportData.summary.date_range?.start} — {reportData.summary.date_range?.end}
                    </p>
                  </div>
                </div> */}
              </div>
            )}

            {/* Split View Container */}
            {reportData.vendors && reportData.vendors.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Left Sidebar: Vendor List */}
                <div className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-4 h-fit">
                  <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Vendors</h4>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {reportData.vendors.map((v) => (
                        <li 
                          key={v.vendor_id}
                          onClick={() => setActiveVendorId(v.vendor_id)}
                          className={`px-4 py-3 text-sm cursor-pointer transition-all flex items-center justify-between group ${activeVendorId === v.vendor_id
                            ? "bg-blue-50 text-primary font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="truncate">{v.vendor_name}</span>
                          {activeVendorId === v.vendor_id && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Content: Selected Vendor Details */}
                <div className="flex-1 min-w-0 w-full space-y-6">
                  {reportData.vendors
                    .filter(v => v.vendor_id === activeVendorId)
                    .map((vendor, vIdx) => (
                      <div key={vendor.vendor_id || vIdx} className="rounded-lg overflow-hidden bg-white animate-in fade-in slide-in-from-right-4 duration-300">

                        <div className="p-0 space-y-0">
                          {vendor.lists && vendor.lists.length > 0 ? (
                            vendor.lists.map((list, lIdx) => (
                              <div key={list.list_id || lIdx} className="p-2 border-b border-gray-200 last:border-0">
                                {/* List Meta Header */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 pb-2">
                                    <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">List ID & Name</p>
                                      <p className="text-sm font-bold text-primary-dark">{list.list_id} - {list.list_name}</p>
                                    </div>
                                    <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Collection Time</p>
                                      <p className="text-sm font-semibold text-gray-700">{list.collection_time ? new Date(list.collection_time).toLocaleString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Last Send</p>
                                      <p className="text-sm font-semibold text-gray-700">{list.last_send_time ? new Date(list.last_send_time).toLocaleString() : 'Never'}</p>
                                    </div>
                                    <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Status</p>
                                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${list.last_send_status === 'success' ? 'bg-green-50 text-green-600 border border-green-100' :
                                          list.last_send_status === 'failed' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            'bg-gray-50 text-gray-500 border border-gray-100'
                                        }`}>
                                        {list.last_send_status}
                                      </span>
                                  </div>
                                </div>

                                    {/* Delivery Table */}
                                <div className="overflow-hidden">
                                  <table className="min-w-full">
                                        <thead className="bg-[#fafbfc]">
                                          <tr>
                                            <th className="w-10 px-4 py-3"></th>
                                            <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Platform Name</th>
                                            <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Delivery</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                          {list.actual_data && list.actual_data.length > 0 ? (
                                            groupDataByPlatform(list.actual_data).map((group, gIdx) => (
                                              <React.Fragment key={group.platform_id || gIdx}>
                                                <tr className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => toggleRow(list.list_id, group.platform_id)}>
                                                  <td className="px-4 py-3 text-center">
                                                    {expandedRows[`${list.list_id}_${group.platform_id}`] ? (
                                                      <ChevronDown className="h-4 w-4 text-primary animate-in fade-in zoom-in duration-200" />
                                                    ) : (
                                                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                                                    )}
                                                  </td>
                                                  <td className="px-4 py-3 text-xs font-bold text-gray-700">{group.platform_name}</td>
                                                  <td className="px-4 py-3 text-xs text-right font-bold text-primary">
                                                    {(group.attempts?.length || 0).toLocaleString()}
                                                  </td>
                                                </tr>
                                                {expandedRows[`${list.list_id}_${group.platform_id}`] && (
                                                  <tr>
                                                    <td colSpan="3" className="px-4 py-0 bg-gray-50/50">
                                                      <div className="animate-in slide-in-from-top-2 duration-300">
                                                        <div className="">
                                                          <table className="min-w-full">
                                                            <thead className="">
                                                              <tr>
                                                                <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">Lead Email</th>
                                                                <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-400 uppercase">Status</th>
                                                                <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-400 uppercase">Time Taken</th>
                                                                <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase">Sent At</th>
                                                              </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                              {group.attempts.map((attempt, aIdx) => (
                                                                <tr key={aIdx} className="hover:bg-blue-50/20 transition-colors">
                                                                  <td className="px-4 py-2 text-xs text-gray-600 font-medium">{attempt.lead_email}</td>
                                                                  <td className="px-4 py-2 text-center">
                                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${attempt.status === 'success' ? 'text-green-600 bg-green-50' : attempt.status === 'rejected' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'}`}>
                                                                      {attempt.status}
                                                                    </span>
                                                                  </td>
                                                                  <td className="px-4 py-2 text-center text-xs text-gray-500 font-medium">{attempt.time_taken}</td>
                                                                  <td className="px-4 py-2 text-right text-xs text-gray-400">
                                                                    {attempt.sent_at ? new Date(attempt.sent_at).toLocaleString() : 'N/A'}
                                                                  </td>
                                                                </tr>
                                                              ))}
                                                            </tbody>
                                                          </table>
                                                        </div>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                )}
                                              </React.Fragment>
                                            ))
                                          ) : (
                                            <tr>
                                              <td colSpan="3" className="px-4 py-10 text-center text-xs text-gray-400 font-medium italic">No delivery data found for this date range</td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-12 text-center">
                              <p className="text-sm text-gray-400 italic">No lists found for this vendor matching the selection</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-400">No data found for the selected vendors/lists.</p>
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
              {/* Vendor Selection */}
              <div className="mb-6">
                <h3 className="text-primary-dark text-sm font-medium mb-3">
                  Select Vendors
                </h3>
                <div className="flex gap-3 justify-between">
                  <div className="mt-3 w-full">
                    <div className="rounded-lg border border-separator overflow-hidden">
                      <div className="h-48 overflow-y-auto bg-neutral-input">
                        <ul className="divide-y divide-gray-100">
                          {dropdownLoading && vendors.length === 0 ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400">
                              Loading vendors...
                            </li>
                          ) : vendors.length === 0 ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400">
                              No vendors available
                            </li>
                          ) : (
                            vendors
                              .filter((v) => !selectedVendors.includes(v.id))
                              .map((vendor) => (
                                <li
                                  key={vendor.id}
                                  className="px-3 sm:px-4 text-xs sm:text-sm py-2 cursor-pointer hover:bg-[#F5F7F9] break-words"
                                  onClick={() => handleSelectVendor(vendor.id)}
                                >
                                  {vendor.display || vendor.vendor_name}
                                </li>
                              ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 w-full">
                    <div className="rounded-lg border border-separator overflow-hidden">
                      <div className="h-48 overflow-y-auto bg-neutral-input">
                        <ul className="divide-y divide-gray-100">
                          {selectedVendors.length === 0 ? (
                            <li className="px-4 py-2 text-sm text-gray-400 text-center">
                              No vendors selected
                            </li>
                          ) : (
                            selectedVendors.map((vendorId) => {
                              const vendor = vendors.find(v => v.id === vendorId);
                              const displayName = vendor?.display || vendor?.vendor_name || `Vendor ${vendorId}`;
                              return (
                                <li
                                  key={vendorId}
                                  className="px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F7F9] flex items-center justify-between"
                                  onClick={() => handleDeselectVendor(vendorId)}
                                >
                                  {displayName}
                                  <X className="h-4 w-4 text-gray-400" />
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-[13px] text-start">
                  <button type="button" className="text-primary underline decoration-dashed underline-offset-4 mr-2 cursor-pointer" onClick={handleSelectAllVendors}>Select All</button> /
                  <button type="button" className="text-primary underline decoration-dashed underline-offset-4 ml-2 cursor-pointer" onClick={handleDeselectAllVendors}>Deselect All</button>
                </div>
              </div>

              {/* List Selection */}
              <div className="mb-6">
                <h3 className="text-primary-dark text-sm font-medium mb-3">
                  Select Lists
                </h3>
                <div className="flex gap-3 justify-between">
                  <div className="mt-3 w-full">
                    <div className="rounded-lg border border-separator overflow-hidden">
                      <div className="h-48 overflow-y-auto bg-neutral-input">
                        <ul className="divide-y divide-gray-100">
                          {dropdownLoading && lists.length === 0 ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400">
                              Loading lists...
                            </li>
                          ) : selectedVendors.length === 0 ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400 text-center">
                              Please select a vendor first
                            </li>
                          ) : lists.length === 0 ? (
                            <li className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400 text-center">
                              No lists found for selected vendors
                            </li>
                          ) : (
                            lists
                              .filter((l) => !selectedLists.includes(l.id))
                              .map((list) => (
                                <li
                                  key={list.id}
                                  className="px-3 sm:px-4 text-xs sm:text-sm py-2 cursor-pointer hover:bg-[#F5F7F9] break-words"
                                  onClick={() => handleSelectList(list.id)}
                                >
                                  {list.display || `${list.id} - ${list.list_name}`}
                                </li>
                              ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 w-full">
                    <div className="rounded-lg border border-separator overflow-hidden">
                      <div className="h-48 overflow-y-auto bg-neutral-input">
                        <ul className="divide-y divide-gray-100">
                          {selectedLists.length === 0 ? (
                            <li className="px-4 py-2 text-sm text-gray-400 text-center">
                              No lists selected
                            </li>
                          ) : (
                            selectedLists.map((listId) => {
                              const list = lists.find(l => l.id === listId);
                              const displayName = list?.display || `${listId} - ${list?.list_name || 'List'}`;
                              return (
                                <li
                                  key={listId}
                                  className="px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F7F9] flex items-center justify-between"
                                  onClick={() => handleDeselectList(listId)}
                                >
                                  {displayName}
                                  <X className="h-4 w-4 text-gray-400" />
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-[13px] text-start">
                  <button type="button" className="text-primary underline decoration-dashed underline-offset-4 mr-2 cursor-pointer" onClick={handleSelectAllLists}>Select All</button> /
                  <button type="button" className="text-primary underline decoration-dashed underline-offset-4 ml-2 cursor-pointer" onClick={handleDeselectAllLists}>Deselect All</button>
                </div>
                {validationErrors.vendors && (
                  <div className="mt-2 text-xs text-red-500">
                    {validationErrors.vendors}
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
                        if (val) {
                          setValidationErrors(prev => ({ ...prev, dates: '' }));
                        }
                      }}
                    />
                  </div>
                </div>
                {validationErrors.dates && (
                  <div className="text-xs text-red-500">
                    {validationErrors.dates}
                  </div>
                )}
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
