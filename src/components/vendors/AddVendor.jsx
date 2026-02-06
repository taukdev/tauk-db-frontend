import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomTextField from '../CustomTextField';
import { Link } from 'react-router-dom';
import DangerCircleIcon from '../../assets/icons/DangerCircle-icon.svg';
import UnionIcon from '../../assets/icons/Union-icon.svg';
import VenderAddPopup from './VenderAddPopup';
import { useDispatch, useSelector } from 'react-redux';
import { setBreadcrumbs } from '../../features/breadcrumb/breadcrumbSlice';
import CustomButton from '../CustomButton';
import { Plus } from 'lucide-react';
import VendorAddPopup from './VenderAddPopup';
import { useVendorTypes } from '../../hooks/vendor/useVendorTypes.js';
import { usePaymentTerms } from '../../hooks/vendor/usePaymentTerms.js';
import { useCountries } from '../../hooks/vendor/useCountries.js';
import { useStates } from '../../hooks/vendor/useStates.js';
import { createVendorApi } from '../../api/vendors.js';
import { useNavigate } from 'react-router-dom';


const referrers = [
    { label: "Google", value: "google" },
    { label: "Friend", value: "friend" },
    { label: "Advertisement", value: "advertisement" },
];

const validationSchema = Yup.object({
    vendorName: Yup.string().required('Vendor name is required'),
    vendorType: Yup.string().required('Vendor type is required'),
    companyName: Yup.string(),
    paymentTerm: Yup.string(),
    phoneNumber: Yup.string(),
    faxNumber: Yup.string(),
    email: Yup.string().email('Invalid email address'),
    address: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    zip: Yup.string(),
    country: Yup.string(),
    otherContactInfo: Yup.string(),
    referrer: Yup.string(),
    allowRecordingUpload: Yup.boolean(),
});


const AddVendor = () => {

    const [isPopupOpen, setPopupOpen] = useState(false);
    const [vendorData, setVendorData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const vendors = useSelector((state) => state.vendors.vendors);
    const firstVendor = vendors[0];
    const navigate = useNavigate();

    // Fetch vendor types from API
    const { vendorTypes, loading: vendorTypesLoading, error: vendorTypesError } = useVendorTypes();

    // Fetch payment terms from API
    const { paymentTerms, loading: paymentTermsLoading, error: paymentTermsError } = usePaymentTerms();

    // Fetch countries from API
    const { countries, loading: countriesLoading, error: countriesError } = useCountries();

    // State to track selected country for states API
    const [selectedCountryId, setSelectedCountryId] = useState(null);

    // Fetch states from API based on selected country
    const { states, loading: statesLoading, error: statesError } = useStates(selectedCountryId);

    const togglePopup = () => setPopupOpen(!isPopupOpen);

    const formik = useFormik({
        initialValues: {
            vendorName: '',
            companyName: '',
            vendorType: '',
            paymentTerm: '',
            phoneNumber: '',
            faxNumber: '',
            email: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            country: '',
            otherContactInfo: '',
            referrer: '',
            allowRecordingUpload: false,
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            setIsSubmitting(true);
            setSubmitError('');

            try {
                const convertToInt = (val) => {
                    if (!val) return val;
                    const num = Number(val);
                    return isNaN(num) ? val : num;
                };

                const payload = {
                    vendor_name: values.vendorName,
                    vendor_type: convertToInt(values.vendorType),
                    company_name: values.companyName || values.vendorName, // Default to vendor name if company name is empty
                    payment_term: convertToInt(values.paymentTerm) || null,
                    phone_number: values.phoneNumber || '',
                    fax_number: values.faxNumber || '',
                    email: values.email || '',
                    address: values.address || '',
                    city: values.city || '',
                    state: convertToInt(values.state) || null,
                    zip: values.zip || '',
                    country: convertToInt(values.country) || null,
                    other_contact_info: values.otherContactInfo || '',
                    referrer: values.referrer?.trim() || null,
                    allow_recording_upload: values.allowRecordingUpload || false,
                };

                const response = await createVendorApi(payload);

                // Handle API response structure: {status: "success", data: {...}}
                // apiJson returns the parsed JSON directly, so response = {status: "success", data: {...}}
                const responseData = response?.data || response;

                // Extract data from API response (backend generates username and password)
                const vendorId = responseData?.id || null;
                const vendorName = responseData?.vendor_name || values.vendorName; // Use backend vendor_name if available
                const username = responseData?.username;
                const password = responseData?.generated_password;

                // Validate that backend returned username and password
                if (!username || !password) {
                    throw new Error("Backend did not return username or password. Please contact support.");
                }

                setVendorData({
                    vendorId: vendorId,
                    vendorName: vendorName, // Use vendor_name from API response
                    username: username,
                    password: password,
                });

                setPopupOpen(true);
            } catch (error) {
                // Check if it's an authentication error that caused redirect
                if (error?.status === 401) {
                    setSubmitError("Your session has expired. Please login again.");
                    // Don't set other errors if we're being redirected
                    return;
                }

                const errorMessage = error?.data?.message || error?.message || "Failed to create vendor. Please try again.";
                setSubmitError(errorMessage);

                if (error?.data?.errors) {
                    Object.keys(error.data.errors).forEach((field) => {
                        const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                        setFieldError(camelField, error.data.errors[field]);
                    });
                }
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Vendors", path: "/vendors" },
                { label: "Add Vendor", path: "/vendors/add" },
            ])
        );
    }, [dispatch]);

    useEffect(() => {
        const countryValue = formik.values.country;
        if (countryValue !== null && countryValue !== undefined && countryValue !== '') {
            const stringValue = String(countryValue).trim();
            if (stringValue !== '') {
                setSelectedCountryId(countryValue);
            } else {
                setSelectedCountryId(null);
            }
        } else {
            setSelectedCountryId(null);
        }
    }, [formik.values.country]);

    return (
        <>

            <div>
                <Link to="/vendors" style={{ textDecoration: 'none' }}>
                    <div className='flex items-center gap-2 md:gap-4 text-primary-dark font-bold text-md'>
                        <img src={UnionIcon} alt="" />
                        <h2 className="text-md text-primary-dark font-bold">Add Vendor</h2>
                    </div>
                </Link>
            </div>


            <div className="p-4 md:p-10 min-h-screen">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md">
                    <div className="p-5">
                        <h2 className="text-md text-primary-dark font-bold">Add Vendor Information</h2>
                    </div>
                    <hr className="border-t border-[#F1F1F4]" />
                    <div className="mx-6 mt-5 md:m-10 md:mt-7">
                        {/* Submit Error Display */}
                        {submitError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                {submitError}
                            </div>
                        )}

                        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                            {/* Vendor Name */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Vendor Name
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="vendorName"
                                        type="text"
                                        placeholder="Vendor name"
                                        value={formik.values.vendorName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.vendorName ? formik.errors.vendorName : ""}
                                    />
                                </div>
                            </div>

                            {/* Vendor Type */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Vendor Type
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="vendorType"
                                        isSelect={true}
                                        options={vendorTypes}
                                        placeholder="Vendor type"
                                        value={formik.values.vendorType}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.vendorType ? formik.errors.vendorType : ""}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 mb-8">
                                <div className="w-full md:w-auto">
                                    <CustomButton
                                        position="start"
                                        type='submit'
                                        fullWidth={false}
                                        className="flex items-center gap-1"
                                        disabled={isSubmitting || formik.isSubmitting}
                                    >
                                        {isSubmitting || formik.isSubmitting ? 'Creating Vendor...' : 'Save Vendor'}
                                    </CustomButton>
                                </div>
                            </div>
                        </form>
                        {vendorData && (
                            <VendorAddPopup
                                isOpen={isPopupOpen}
                                onClose={togglePopup}
                                vendorName={vendorData.vendorName}
                                username={vendorData.username}
                                password={vendorData.password}
                                vendorId={vendorData.vendorId}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddVendor;