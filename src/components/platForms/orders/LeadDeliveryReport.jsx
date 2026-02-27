import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import UnionIcon from "../../../assets/icons/Union-icon.svg";
import ReportSearch from "../../../assets/report-search.svg";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectPlatformById } from "../../../features/platform/platformSlice";
import DatePickerField from "../../DatePickerField";
import CustomButton from "../../CustomButton";
import CustomTextField from "../../CustomTextField";
import { fetchOrderLeadReport, clearReportData, setStartDate, setEndDate } from "../../../features/reports/OrderLeadReportSlice";

const LeadDeliveryReport = () => {
  const { platformId, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const platform = useSelector((state) => selectPlatformById(state, platformId));

  const { reportData, loading, error: reportError, startDate, endDate } = useSelector((state) => state.orderLeadReport);

  const handleRunReport = () => {
    dispatch(fetchOrderLeadReport({
      platformId,
      orderId: id,
      params: { start_date: startDate, end_date: endDate }
    }));
  };

  useEffect(() => {
    // Initial fetch if needed, or just wait for "Run Report"
    return () => {
      dispatch(clearReportData());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Platforms", path: "/platforms" },
        { label: platform?.name, path: "/platforms/" + platform?.id + "/" },
        { label: `${id} - Lead Order `, path: "/platform/" + platform?.id + "/orders/" + id + "/" },
        { label: "Lead Delivery Report", path: "/platform/" + platform?.id + "/orders/" + id + "/lead-delivery-report" },
      ])
    );
  }, [dispatch]);

  return (
    <div>
      <div className="md:gap-4  text-primary-dark font-bold text-md">
        <Link to={`/platform/${platformId}/orders/${id}`} style={{ textDecoration: "none" }} className="flex items-center gap-2">
          <img src={UnionIcon} alt="Back" />
          <h2 className="text-md text-primary-dark font-bold">Lead Delivery Report</h2>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow  mt-4">
        <div className="mb-4 border-b border-[#E1E3EA]">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-5 py-5">
            <div>
              <h2 className="text-md sm:text-lg font-bold text-primary-dark">Lead Report Filters</h2>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Start Date */}
              <div className="w-full sm:w-[180px]">
                <DatePickerField
                  label="Start Date"
                  value={startDate}
                  onChange={(val) => dispatch(setStartDate(val))}
                />
              </div>

              <div className="w-full sm:w-[180px]">
                <DatePickerField
                  label="End Date"
                  value={endDate}
                  onChange={(val) => dispatch(setEndDate(val))}
                />
              </div>

              <div className="flex items-center gap-2">
              </div>

              {/* Run Report Button */}
              <div className="w-full md:w-auto">
                <CustomButton
                  onClick={handleRunReport}
                  className=""
                >
                  Run Report
                </CustomButton>
              </div>
            </div>
          </div>
        </div>


        {loading ? (
          <div className="flex flex-col items-center justify-center lg:min-h-[600px] text-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg text-gray-500">Generating report...</p>
          </div>
        ) : reportData ? (
          <div className="p-5 md:p-8">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Total Delivered */}
              <div className="bg-gradient-to-br from-white to-[#F8FAFC] p-6 rounded-2xl border border-[#E1E3EA] shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-5">
                  <div className="bg-[#EEF2FF] p-4 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6 text-primary group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">Total Delivered</p>
                    <h3 className="text-3xl font-extrabold text-[#0F172A]">
                      {reportData.summary?.total_leads_delivered || 0}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Total Rejected */}
              <div className="bg-gradient-to-br from-white to-[#FFF7F7] p-6 rounded-2xl border border-[#E1E3EA] shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-5">
                  <div className="bg-[#FFF1F2] p-4 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6 text-red-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">Total Rejected</p>
                    <h3 className="text-3xl font-extrabold text-[#0F172A]">
                      {reportData.summary?.total_leads_rejected || 0}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-gradient-to-br from-white to-[#FFFBEB] p-6 rounded-2xl border border-[#E1E3EA] shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-5">
                  <div className="bg-[#FFFBEB] p-4 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6 text-amber-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">Date Range</p>
                    <p className="text-sm font-bold text-[#0F172A]">
                      {reportData.summary?.date_range?.start} <span className="text-gray-400 font-normal mx-1">to</span> {reportData.summary?.date_range?.end}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  Daily Breakdown
                </h3>
              </div>

              <div className="overflow-hidden border border-[#E1E3EA] rounded-2xl shadow-sm bg-white">
                <table className="min-w-full divide-y divide-[#E1E3EA]">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-[0.1em]">Date</th>
                      <th className="px-6 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-[0.1em]">Delivered Leads</th>
                      <th className="px-6 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-[0.1em]">Rejected Leads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E3EA] bg-white">
                    {reportData.daily_breakdown && reportData.daily_breakdown.length > 0 ? (
                      reportData.daily_breakdown.map((row, index) => (
                        <tr key={index} className="hover:bg-[#F8FAFC] transition-colors duration-200 group">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0F172A]">
                            {row.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-primary">
                              {row.leads_delivered || row.delivered || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-500">
                              {row.leads_rejected || row.rejected || 0}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-10 py-16 text-center">
                          <p className="text-sm font-medium text-gray-400">No daily data available for this range.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center lg:min-h-[600px] text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <img src={ReportSearch} alt="Search" />
            </div>
            <p className="text-lg text-[#4B5563] max-w-md font-medium">
              {reportError ? `Error: ${reportError}` : "Your search returned no results. Please try a different date range."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDeliveryReport;


