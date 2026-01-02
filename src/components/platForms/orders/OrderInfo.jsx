import React from "react";
import OrderPollingPopup from "./OrderPollingPopup";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../../CustomTextField";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderNotes, updateInternalViewOnly, updatePricePerLead } from "../../../features/platform/orderDetailSlice";

import DangerCircleIcon from "../../../assets/icons/DangerCircle-icon.svg";
import CustomButton from "../../CustomButton";

const OrderInfo = ({ orderDetails }) => {
  const { platformId, id } = useParams();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const [showPollingPopup, setShowPollingPopup] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const formik = useFormik({
    initialValues: {
      orderNotes: orderDetails?.orderNotes ?? "",
      internalViewOnly: orderDetails?.internalViewOnly ?? true,
      pricePerLead: orderDetails?.pricePerLead ?? 0.0,
      isTestFile: typeof orderDetails?.isTestFile === "boolean" ? orderDetails.isTestFile : true,
    },
    validationSchema: Yup.object({
      pricePerLead: Yup.number().min(0, "Price must be positive"),
    }),
    onSubmit: (values) => {
      console.log("Order updated:", values);
      // Handle form submission here
    },
    enableReinitialize: true, // re-init if orderDetails changes
  });

  const handleNotesChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue("orderNotes", value);
    dispatch(updateOrderNotes(value));
  };

  // Accepts an event-like object: { target: { name, value } }
  const handleInternalViewChange = (e) => {
    const value = e.target.value === "true"; // DOM radios return "true"/"false"
    formik.setFieldValue("internalViewOnly", value);
    dispatch(updateInternalViewOnly(value));
  };

  const handlePriceChange = (e) => {
    // e may be native event or object from CustomTextField; handle both
    const raw = e?.target?.value ?? e;
    const value = parseFloat(raw) || 0;
    formik.setFieldValue("pricePerLead", value);
    dispatch(updatePricePerLead(value));
  };

  if (!orderDetails) {
    return (
      <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-3 sm:p-4 md:p-6 mobile-responsive">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-5 gap-2 sm:gap-3 border-b border-[#E1E3EA] pb-3 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
        <h2 className="text-sm sm:text-xs md:text-sm font-medium text-black mobile-title">
          List ID - {orderDetails.leadOrderId}
        </h2>
        <div className="relative self-start sm:self-auto" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-[#E1E3EA] flex items-center gap-2 cursor-pointer"
          >
            More Options
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.22 3.814a.75.75 0 01-1.02 0L5.25 8.33a.75.75 0 01-.02-1.12z" clipRule="evenodd" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute left-0 right-auto sm:right-0 sm:left-auto top-full mt-2 w-60 bg-white border border-[#E1E3EA] rounded-xl shadow-lg z-10 p-2">
              <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-dark cursor-pointer hover:bg-gray-50" onClick={() => { navigate(`/outgoing-post/${id}/modify`); setMenuOpen(false); }}>Modify Post</button>
              <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-dark cursor-pointer hover:bg-gray-50" onClick={() => { navigate(`/platform/${platformId}/orders/${orderDetails.leadOrderId}/lead-delivery-report`); setMenuOpen(false); }}>Lead Delivery Report</button>
              <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-dark cursor-pointer hover:bg-gray-50" onClick={() => { setShowPollingPopup(true); setMenuOpen(false); }}>Order Polling</button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="md:space-y-4 mobile-form space-y-4">
        {/* Lead Order ID */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Lead Order ID
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.leadOrderId}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Platform */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Platform
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            {orderDetails?.platformId ? (
              <Link
                to={`/platforms/${orderDetails.platformId}`}
                className="text-primary pl-2 text-[13px] underline decoration-dashed hover:text-[#0066CC] transition-colors"
              >
                {orderDetails.platform && orderDetails.platform !== "N/A" 
                  ? orderDetails.platform 
                  : "N/A"}
              </Link>
            ) : (
              <span className="text-gray-500 pl-2 text-[13px]">
                {orderDetails?.platform && orderDetails.platform !== "N/A" 
                  ? orderDetails.platform 
                  : "N/A"}
              </span>
            )}
          </div>
        </div>

        {/* Date Entered */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Date Entered
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.dateEntered}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Order Notes */}
        <div className="flex flex-col md:flex-row items-start md:items-start gap-2 md:gap-4">
          <label className="w-full md:w-1/4 text-[13px] text-neutral font-medium">
            Order Notes
          </label>
          <div className="w-full md:w-3/4">
            <CustomTextField
              isTextArea
              name="orderNotes"
              placeholder="Write note"
              value={formik.values.orderNotes}
              onChange={handleNotesChange}
              onBlur={formik.handleBlur}
              error={formik.touched.orderNotes ? formik.errors.orderNotes : ""}
              size="md"
            />
          </div>
        </div>

        {/* Internal View Only (replaced with CustomTextField isRadio) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Internal View Only
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4 pl-2">
            <CustomTextField
              name="internalViewOnly"
              isRadio={true}
              options={[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ]}
              value={formik.values.internalViewOnly}
              onChange={handleInternalViewChange}
              className="!mb-0"
            />
          </div>
        </div>

        {/* Leads Delivered */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Leads Delivered
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails?.leadsDelivered !== undefined && orderDetails?.leadsDelivered !== null 
                ? String(orderDetails.leadsDelivered) 
                : "0"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Price Per Lead */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
            Price Per Lead
          </label>
          <div className="w-full md:w-3/4">
            <CustomTextField
              name="pricePerLead"
              min="0"
              type="number"
              step="0.01"
              value={formik.values.pricePerLead}
              onChange={handlePriceChange}
              onBlur={formik.handleBlur}
              error={formik.touched.pricePerLead ? formik.errors.pricePerLead : ""}
            />
          </div>
        </div>

        {/* Dedupe Back Days */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Dedupe Back Days
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.dedupeBackDays}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Date Seeded */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Date Seeded
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <div className="flex items-center gap-2">
              <img src={DangerCircleIcon} alt="Warning" className="w-4 h-4" />
              <span className="text-[13px] text-primary-dark font-medium">This feature is not enabled</span>
            </div>
          </div>
        </div>

        {/* Field Selection Type */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Field Selection Type
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.fieldSelectionType}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Signup Dates */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Signup Dates
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.signupDates || "N/A"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Countries */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Countries
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.countries || "N/A"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Area Codes */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Area Codes
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.areaCodes || "N/A"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Gender
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.gender || "N/A"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Offer URL */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Offer URL
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.offerUrl}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Lists */}
        <div className="flex flex-col sm:flex-row items-start sm:items-start ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Lists
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4 pl-2">
            <div className="space-y-1">
              {orderDetails.lists && Array.isArray(orderDetails.lists) && orderDetails.lists.length > 0 ? (
                orderDetails.lists.map((list, index) => (
                  <div key={index} className="text-[13px] text-primary-dark">
                    {index + 1}. {list}
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-gray-500">N/A</div>
              )}
            </div>
          </div>
        </div>

        {/* Disregard Locks */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Disregard Locks
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.disregardLocks}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Excluded States / Selected States */}
        <div className="flex flex-col sm:flex-row items-start sm:items-start ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            {orderDetails.excludeStates ? "Excluded States" : "Selected States"}
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4 pl-2">
            {(() => {
              // Check if excludedStates is a string (from API) or array
              const statesValue = orderDetails.excludedStates || orderDetails.selectedStates;
              
              if (!statesValue || statesValue === "N/A") {
                return <div className="text-[13px] text-gray-500">N/A</div>;
              }
              
              // If it's an array, display as list
              if (Array.isArray(statesValue) && statesValue.length > 0) {
                return (
                  <div className="space-y-1">
                    {statesValue.map((state, index) => (
                      <div key={index} className="text-[13px] text-primary-dark">
                        {state}
                      </div>
                    ))}
                  </div>
                );
              }
              
              // If it's a string, check if it's comma-separated or single value
              if (typeof statesValue === 'string') {
                const statesArray = statesValue.split(',').map(s => s.trim()).filter(s => s && s !== "N/A");
                if (statesArray.length > 0) {
                  return (
                    <div className="space-y-1">
                      {statesArray.map((state, index) => (
                        <div key={index} className="text-[13px] text-primary-dark">
                          {state}
                        </div>
                      ))}
                    </div>
                  );
                }
                return <div className="text-[13px] text-primary-dark">{statesValue}</div>;
              }
              
              return <div className="text-[13px] text-gray-500">N/A</div>;
            })()}
          </div>
        </div>

        {/* Excluded ESPs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Excluded ESPs
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.excludedESPs || "N/A"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Included ESPs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Included ESPs
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.includedESPs || "N/A"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Import Dates */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Import Dates
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails?.importDates && orderDetails.importDates !== "N/A" 
                ? orderDetails.importDates 
                : "N/A"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Order Type */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Order Type
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <input
              type="text"
              value={orderDetails.orderType || "POST Download file (see daily breakdown on right)"}
              disabled
              className="w-full p-0 md:p-2 text-[13px] rounded-lg text-primary-dark"
            />
          </div>
        </div>

        {/* Is it a Test File? (replaced with CustomTextField isRadio) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center ">
          <label className="w-full sm:w-1/3 md:w-1/4 text-[13px] text-neutral font-medium ">
            Is it a Test File?
          </label>
          <div className="w-full sm:w-2/3 md:w-3/4">
            <CustomTextField
              name="isTestFile"
              isRadio={true}
              options={[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ]}
              value={formik.values.isTestFile}
              onChange={(e) => {
                const value = e.target.value === "true";
                formik.setFieldValue("isTestFile", value);
              }}
              className="!mb-0"
            />
          </div>
        </div>

        {/* Submit */}
        <CustomButton
          type="submit"
          position="end"
          className="px-6 py-3 rounded-xl text-[15px]"
        >
          Save Changes
        </CustomButton>
      </form>

      {/* Order Polling Popup */}
      <OrderPollingPopup
        open={showPollingPopup}
        onClose={() => setShowPollingPopup(false)}
        pollKey={orderDetails?.pollKey || 'BL8ABRXDKQMZJ9KIXPG7FQIVYH'}
        orderId={orderDetails?.leadOrderId || '12695'}
      />
    </div>
  );
};

export default OrderInfo;
