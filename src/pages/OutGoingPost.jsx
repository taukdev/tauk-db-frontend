import React, { useEffect } from "react";
import ImportedData from "../components/outGoingPost/ImportedData";
import CustomTitle from "../components/CustomTitle";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../features/breadcrumb/breadcrumbSlice";

const OutGoingPost = () => {

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
                    className="pb-2 px-3 cursor-pointer font-medium text-sm transition-colors border-b-2 border-primary text-primary"
                >
                    Outgoing Posts
                </button>
            </div>

            <div className="grid mt-5">
                <ImportedData />
            </div>
        </div>
    );
};

export default OutGoingPost;