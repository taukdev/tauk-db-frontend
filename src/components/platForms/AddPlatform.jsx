import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../CustomTextField";
import { Link } from "react-router-dom";
import UnionIcon from "../../assets/icons/Union-icon.svg";
import DangerCircleIcon from "../../assets/icons/DangerCircle-icon.svg";
import { useDispatch, useSelector } from "react-redux";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import CustomButton from "../CustomButton";
import { useNavigate } from "react-router-dom";
import {
    fetchPlatformDropdowns,
    fetchStatesByCountry,
    createPlatform
} from "../../features/platform/platformSlice";

// Validation Schema
const validationSchema = Yup.object({
    name: Yup.string().required("Platform name is required"),
    platformType: Yup.string().required("Platform type is required"),
    referrerPercent: Yup.number().typeError("Must be a number"),
});

const AddPlatform = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dropdowns, loading } = useSelector((state) => state.platform);
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Platforms", path: "/platforms" },
                { label: "Add Platform", path: "/platforms/add" },
            ])
        );
        dispatch(fetchPlatformDropdowns());
    }, [dispatch]);

    // Derived options from API
    const platformTypes = dropdowns.types.map(t => ({
        label: t.type_name || t.name || t.label || String(t.id || ""),
        value: String(t.id || t.value || t)
    }));
    const paymentTerms = dropdowns.terms.map(t => ({
        label: t.term_name || t.name || t.label || String(t.id || ""),
        value: String(t.id || t.value || t)
    }));
    const countries = dropdowns.countries.map(c => ({
        label: c.country_name || c.name || c.label || String(c.id || ""),
        value: String(c.id || c.value || c)
    }));
    const states = dropdowns.states.map(s => ({
        label: s.state_name || s.name || s.label || String(s.id || ""),
        value: String(s.id || s.value || s)
    }));
    const cutoffs = dropdowns.cutoffs.map(c => ({
        label: c.cutoff_label || c.name || c.label || String(c.id || ""),
        value: String(c.id || c.value || c)
    }));

    const referrers = [{ label: "N/A", value: "N/A" }];
    const salesReps = [{ label: "N/A", value: "N/A" }];

    const formik = useFormik({
        initialValues: {
            name: "",
            platformType: "",
            phone: "",
            fax: "",
            email: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            otherContactInfo: "",
            leadReturnCutoff: "",
            referrer: "N/A",
            referrerPercent: "0.00",
            salesRep: "N/A",
            sinceYear: "2020",
            baseOfflineUrl: "",
            internalViewOnly: false,
        },
        validationSchema,
        onSubmit: async (values) => {
            const payload = {
                platform_name: values.name,
                platform_type: parseInt(values.platformType),
                referrer_percent: parseFloat(values.referrerPercent),
            };

            try {
                const result = await dispatch(createPlatform(payload)).unwrap();
                if (result) {
                    navigate("/platforms");
                }
            } catch (error) {
                console.error("Failed to create platform:", error);
            }
        },
    });

    const handleCountryChange = (e) => {
        const countryId = e.target.value;
        formik.setFieldValue("country", countryId);
        formik.setFieldValue("state", ""); // Reset state when country changes
        if (countryId) {
            dispatch(fetchStatesByCountry(countryId));
        }
    };

    return (
        <>
            {/* Header */}
            <div className="md:gap-4 text-primary-dark font-bold text-md">
                <Link to="/platforms" style={{ textDecoration: "none" }} className="flex items-center gap-2">
                    <img src={UnionIcon} alt="Back" />
                    <h2 className="text-md text-primary-dark font-bold">Add Platform</h2>
                </Link>
            </div>

            {/* Form Container */}
            <div className="lg:p-4 md:p-4 mt-3 md:mt-1 min-h-screen">
                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md">
                    <div className="p-5">
                        <h2 className="text-md text-primary-dark font-bold">
                            Add Platform Information
                        </h2>
                    </div>
                    <hr className="border-t border-[#F1F1F4]" />

                    <div className="mx-4 md:mx-10 mt-3 md:mt-6">
                        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-1 md:gap-5 ">

                            {/* Platform Name */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Platform Name
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="name"
                                        type="text"
                                        placeholder="Platform name"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.name ? formik.errors.name : ""}
                                    />
                                </div>
                            </div>

                            {/* Company Name */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Company Name
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="company"
                                        type="text"
                                        placeholder="Company name"
                                        value={formik.values.company}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.company ? formik.errors.company : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Platform Type */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Platform Type
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="platformType"
                                        placeholder="Select Platform Type"
                                        isSelect
                                        options={platformTypes}
                                        value={formik.values.platformType}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.platformType ? formik.errors.platformType : ""}
                                    />
                                </div>
                            </div>

                            {/* Payment Term */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Payment Term
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="paymentTerm"
                                        placeholder="Select Payment Term"
                                        isSelect
                                        options={paymentTerms}
                                        value={formik.values.paymentTerm}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.paymentTerm ? formik.errors.paymentTerm : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Phone Number */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Phone Number
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="phone"
                                        type="text"
                                        placeholder="Phone number"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.phone ? formik.errors.phone : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Fax Number */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Fax Number
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="fax"
                                        type="text"
                                        placeholder="Fax number"
                                        value={formik.values.fax}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.fax ? formik.errors.fax : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Email */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Email
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.email ? formik.errors.email : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Address */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Address
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="address"
                                        type="text"
                                        placeholder="Address"
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.address ? formik.errors.address : ""}
                                    />
                                </div>
                            </div> */}

                            {/* City */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    City
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="city"
                                        type="text"
                                        placeholder="City"
                                        value={formik.values.city}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.city ? formik.errors.city : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Country */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Country
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="country"
                                        isSelect
                                        placeholder="Select Country"
                                        options={countries}
                                        value={formik.values.country}
                                        onChange={handleCountryChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.country ? formik.errors.country : ""}
                                    />
                                </div>
                            </div> */}

                            {/* State */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    State
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="state"
                                        isSelect
                                        placeholder="Select State"
                                        options={states}
                                        value={formik.values.state}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.state ? formik.errors.state : ""}
                                    />
                                </div>
                            </div> */}

                            {/* 
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Zip
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="zip"
                                        type="text"
                                        placeholder="Enter zip"
                                        value={formik.values.zip}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.zip ? formik.errors.zip : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Other Contact Info (textarea) */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-start gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Other Contact Info
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        isTextArea
                                        name="otherContactInfo"
                                        placeholder="eg: Skype: examplehandle"
                                        value={formik.values.otherContactInfo}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.otherContactInfo ? formik.errors.otherContactInfo : ""
                                        }
                                        size="md"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Skype, WhatsApp, Viber, etc.
                                    </p>
                                </div>
                            </div> */}

                            {/* Lead Return Cutoff */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Lead Return Cutoff
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="leadReturnCutoff"
                                        isSelect
                                        placeholder="Select Cutoff"
                                        options={cutoffs}
                                        value={formik.values.leadReturnCutoff}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.leadReturnCutoff ? formik.errors.leadReturnCutoff : ""
                                        }
                                    />
                                </div>
                            </div> */}

                            {/* Referrer */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Referrer
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="referrer"
                                        isSelect
                                        options={referrers}
                                        value={formik.values.referrer}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.referrer ? formik.errors.referrer : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Referrer Percent */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Referrer Percent
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="referrerPercent"
                                        min="0"
                                        type="number"
                                        placeholder="0.00"
                                        value={formik.values.referrerPercent}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.referrerPercent ? formik.errors.referrerPercent : ""
                                        }
                                    />
                                </div>
                            </div> */}

                            {/* Sales Rep */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Sales Rep
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="salesRep"
                                        isSelect
                                        options={salesReps}
                                        value={formik.values.salesRep}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.salesRep ? formik.errors.salesRep : ""}
                                    />
                                </div>
                            </div> */}

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 mb-8">
                                {/* Left Column - Info Text */}
                                {/* <div className="flex gap-2 items-start md:items-center w-full md:w-[70%] lg:w-auto text-[11.5px] text-gray-600">
                                    <img src={DangerCircleIcon} alt="Danger Icon" className="w-4 h-4 mt-0.5 md:mt-0" />
                                    <p className="text-justify text-xs">
                                        The system will automatically generate a Username and Password for this Platform. You will see them on the next page.
                                    </p>
                                </div> */}

                                {/* Right Column - Submit Button */}
                                <div className="w-full md:w-auto">
                                    <CustomButton
                                        type="submit"
                                        position="end"
                                        className="cursor-pointer "
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save platform"}
                                    </CustomButton>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddPlatform;