import React from "react";
import crossIcon from "../../../assets/icons/cross-icon.svg";
import orderPolling from "../../../assets/order-polling.svg";

const OrderPollingPopup = ({ open, onClose, pollKey, orderId }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[680px] sm:max-w-lg mx-0 sm:mx-4 overflow-hidden">
                {/* Header with Close */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-primary-dark">Order Polling</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                        aria-label="Close"
                    >
                        <img src={crossIcon} alt="Close"/>
                    </button>
                </div>

                {/* Illustration */}
                <div className="flex justify-center mb-4 px-4 pt-4">
                    <img src={orderPolling} alt="Order Polling Illustration" className="w-40 sm:w-auto max-w-full h-auto" />
                </div>

                {/* Content */}
                <div className="pb-6 text-center max-h-[70vh] overflow-y-auto">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 text-center px-4 sm:px-6">
                        Order polling can be used to periodically suck out (poll) leads
                        delivered through an order. For example you may have a live post or
                        priority order that deliver leads to an API. Using our polling
                        mechanism, you can grab those leads at intervals (e.g. every 5 or 15
                        minutes) and do something else with them.
                    </p>

                    {/* Parameters Section */}
                    <div className="border-t border-gray-200 pt-4 text-left px-4 sm:px-6">
                        <h3 className="text-sm sm:text-base font-medium text-primary-dark mb-2">
                            Parameters you need to poll data from this order:
                        </h3>
                        <div className="space-y-3 text-sm sm:text-base">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 break-all">
                                <span className="font-normal text-gray-400 min-w-[80px]">Poll Key:</span>
                                <span className="text-primary font-mono">{pollKey}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 break-all">
                                <span className="font-normal text-gray-400 min-w-[80px]">Order ID:</span>
                                <span className="text-gray-900 font-mono">{orderId}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPollingPopup;
