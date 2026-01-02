import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderDetails,
  fetchDailyDeliveryBreakdown,
  clearOrderDetails,
} from "../../../features/platform/orderDetailSlice";

// Subcomponents
import OrderInfo from "./OrderInfo";
import DailyDeliveryBreakdown from "./DailyDeliveryBreakdown";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import { selectPlatformById } from "../../../features/platform/platformSlice";

export default function OrderDetail() {
  const { platformId, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const platform = useSelector((state) =>
    selectPlatformById(state, platformId)
  );

  const { orderDetails, dailyBreakdown, loading, error } = useSelector(
    (state) => state.orderDetail
  );

  useEffect(() => {
    if (id && platformId) {
      dispatch(fetchOrderDetails({ platformId, orderId: id }));
      dispatch(fetchDailyDeliveryBreakdown(id));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Platforms", path: "/platforms" },
        { label: platform?.name, path: "/platforms/" + platform?.id + "/" },
        {
          label: `${id} - Lead Order `,
          path: "/platform/" + platform?.id + "/orders/" + id + "/",
        },
      ])
    );
  }, [dispatch]);

  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-800 text-sm">
              Error loading order details: {error}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading && !orderDetails) {
    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div>
              <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-6 text-center">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="space-y-1 xs:space-y-2">
        <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-primary-dark break-words">
          {orderDetails.leadOrderId} - Lead Order
        </h1>
        {/* <p className="text-xs xs:text-sm sm:text-base text-gray-500">
          Order entered on {orderDetails.dateEntered}
        </p> */}
      </div>

      {/* Layout - Responsive Grid - Equal Width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 md:gap-6">
        {/* Order Info Section - 50% width on desktop */}
        <div className="order-1">
          <OrderInfo orderDetails={orderDetails} />
        </div>

        {/* Daily Delivery Breakdown - 50% width on desktop */}
        <div className="order-2  lg:sticky lg:top-[-105px] self-start">
          <DailyDeliveryBreakdown
            dailyBreakdown={dailyBreakdown}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
