import React, { useEffect, useState } from "react";
import ImportedData from "../components/outGoingPost/ImportedData";
import PriorityPosts from "../components/outGoingPost/PriorityPosts";
import BiddingPosts from "../components/outGoingPost/BiddingPosts";
import CustomTitle from "../components/CustomTitle";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../features/breadcrumb/breadcrumbSlice";

const OutGoingPost = () => {
    const [activeTab, setActiveTab] = useState("imported");

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Outgoing Posts", path: "/outgoing-post" },
            ])
        );
    }, [dispatch])


    return (
        <div>
            <CustomTitle>Outgoing Post</CustomTitle>
            <div className="flex gap-6 items-center mt-6">
                <button
                    onClick={() => setActiveTab("imported")}
                    className={`pb-2 px-3 cursor-pointer font-medium text-sm transition-colors ${activeTab === "imported"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-primary"
                        }`}
                >
                    Imported Data
                </button>
                <button
                    onClick={() => setActiveTab("priority")}
                    className={`pb-2 px-3 cursor-pointer font-medium text-sm transition-colors ${activeTab === "priority"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-primary"
                        }`}
                >
                    Priority Posts
                </button>
                <button
                    onClick={() => setActiveTab("bidding")}
                    className={`pb-2 px-3 cursor-pointer font-medium text-sm transition-colors ${activeTab === "bidding"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-primary"
                        }`}
                >
                    Bidding Posts
                </button>
            </div>

            <div className="grid mt-5">
                {activeTab === "imported" && <ImportedData />}
                {activeTab === "priority" && <PriorityPosts />}
                {activeTab === "bidding" && <BiddingPosts />}
            </div>
        </div>
    );
};

export default OutGoingPost;