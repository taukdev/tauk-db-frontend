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

const LeadDeliveryReport = () => {
  const { platformId, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const platform = useSelector((state) => selectPlatformById(state, platformId));

  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [shortcut, setShortcut] = React.useState("today");

  const handleRunReport = () => {
    // Placeholder: wire to API later. Keeps page dynamic with state.
    // You can fetch with id, startDate, endDate, shortcut.
    console.log("Run report", { id, startDate, endDate, shortcut });
  };

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
              <h2 className="text-[16px] font-semibold text-primary-dark">Lead Report</h2>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Start Date */}
              <div className="w-full md:w-[150px] ">
                <DatePickerField
                  label="Start Date"
                  value={startDate}
                  onChange={(val) => dispatch(setStartDate(val))}
                />
              </div>

              {/* End Date */}
              <div className="w-full md:w-[150px] ">
                <DatePickerField
                  label="End Date"
                  value={endDate}
                  onChange={(val) => dispatch(setEndDate(val))}
                />
              </div>

              {/* Shortcut Dropdown */}
              <div className="flex items-center gap-2">
                <div className="pt-0 md:pt-0">
                <CustomTextField
                  isSelect
                  options={[
                    { label: "Today", value: "today" },
                    { label: "Yesterday", value: "yesterday" },
                    { label: "This Month", value: "This Month" },
                  ]}
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  placeholder="Shortcuts"
                  size="sm"  
                  inputClassName="!rounded-[6px]" 
                />
                </div>


                {/* Shortcut Badge */}
                {shortcut !== "today" && (
                  <div className="flex items-center mb-4 md:mb-0 px-3 py-[4px] bg-neutral-input text-[#252F4A] text-sm font-normal gap-1 border border-gray-200 rounded-lg">
                    <span className="bg-secondary-light text-[#78829D]">Shortcut:</span> {shortcut}
                    <button
                      type="button"
                      className="ml-1 text-gray-400 hover:text-gray-600 text-lg font-bold focus:outline-none"
                      onClick={() => setShortcut("today")}
                      aria-label="Clear shortcut filter"
                    >
                      ×
                    </button>
                  </div>
                )}
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


        <div className="flex flex-col items-center justify-center lg:min-h-[600px] text-center p-6">
          <div className="flex items-center justify-center mb-4">
            <img src={ReportSearch} alt="Search" />
          </div>
          <p className="text-lg text-[#4B5563] max-w-md font-medium">
            Your search returned no results. Please try a different date range.
          </p>

        </div>
      </div>
    </div>
  );
};

export default LeadDeliveryReport;


