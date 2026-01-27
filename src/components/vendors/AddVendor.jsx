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
    companyName: Yup.string().required('Company name is required'),
    vendorType: Yup.string().required('Vendor type is required'),
    paymentTerm: Yup.string().required('Payment term is required'),
    phoneNumber: Yup.string()
        .required('Phone number is required')
        .matches(
            /^(\+?\d{1,3}[- ]?)?\d{10}$/,
            'Invalid phone number'
        ),
    faxNumber: Yup.string()
        .required('Fax number is required')
        .matches(/^[0-9+\-() ]*$/, 'Invalid fax number'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zip: Yup.string().required('Zip is required'),
    country: Yup.string().required('Country is required'),
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
                    company_name: values.companyName,
                    vendor_type: convertToInt(values.vendorType),
                    payment_term: convertToInt(values.paymentTerm),
                    phone_number: values.phoneNumber,
                    fax_number: values.faxNumber,
                    email: values.email,
                    address: values.address,
                    city: values.city,
                    state: convertToInt(values.state),
                    zip: values.zip,
                    country: convertToInt(values.country),
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

                            {/* Company Name */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Company Name
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="companyName"
                                        type="text"
                                        placeholder="Company name"
                                        value={formik.values.companyName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.companyName ? formik.errors.companyName : ""}
                                    />
                                </div>
                            </div> */}


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

                            {/* Payment Term */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Payment Term
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="paymentTerm"
                                        isSelect={true}
                                        options={paymentTerms}
                                        placeholder="Payment term"
                                        value={formik.values.paymentTerm}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.paymentTerm ? formik.errors.paymentTerm : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Phone Number */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Phone Number
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="phoneNumber"
                                        type="tel"
                                        placeholder="Phone number"
                                        value={formik.values.phoneNumber}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.phoneNumber ? formik.errors.phoneNumber : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Fax Number */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Fax Number
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="faxNumber"
                                        type="text"
                                        placeholder="Fax number"
                                        value={formik.values.faxNumber}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.faxNumber ? formik.errors.faxNumber : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Email */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
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
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
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

                            {/* City
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
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
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Country
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="country"
                                        isSelect={true}
                                        options={countries}
                                        placeholder="Country"
                                        value={formik.values.country}
                                        onChange={(e) => {
                                            const countryValue = e.target.value;
                                            formik.handleChange(e);
                                            formik.setFieldValue('state', '');
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
                                        }}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.country ? formik.errors.country : ""}
                                    />
                                </div>
                            </div> */}

                            {/* State */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    State
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="state"
                                        isSelect={true}
                                        options={states}
                                        placeholder={selectedCountryId ? (statesLoading ? "Loading states..." : "Select state") : "Select country first"}
                                        value={formik.values.state}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.state ? formik.errors.state : ""}
                                        disabled={!selectedCountryId || statesLoading}
                                    />
                                </div>
                            </div> */}

                            {/* Zip */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
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

                            {/* Other Contact Info */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Other Contact Info
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="otherContactInfo"
                                        isTextArea={true}
                                        placeholder="eg: Skype: examplehandle"
                                        value={formik.values.otherContactInfo}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.otherContactInfo ? formik.errors.otherContactInfo : ""}
                                        rows={2}
                                        className='mb-0'
                                    />
                                    <div className="text-xs text-gray-500 mb-2">Skype, WhatsApp, Viber, etc.</div>
                                </div>
                            </div> */}

                            {/* Referrer */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Referrer
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="referrer"
                                        type="text"
                                        placeholder="Enter referrer"
                                        value={formik.values.referrer}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.referrer ? formik.errors.referrer : ""}
                                    />
                                </div>
                            </div> */}

                            {/* Allow Recording Upload */}
                            {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                                    Allow Recording Upload
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        name="allowRecordingUpload"
                                        isToggle={true}
                                        value={formik.values.allowRecordingUpload}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                </div>
                            </div> */}

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 mb-8">
                    
                                {/* <div className="flex gap-2 items-start md:items-center w-full md:w-[70%] lg:w-auto text-[11.5px] text-gray-600">
                                    <img src={DangerCircleIcon} alt="Danger Icon" className="w-4 h-4 mt-0.5 md:mt-0" />
                                    <p className="text-justify">
                                        The system will automatically generate a Username and Password for this vendor. You will see them on the next page.
                                    </p>
                                </div> */}

                                {/* Right Column - Submit Button */}
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
                                vendorId={vendorData.vendorId} //  pass vendor ID correctly
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddVendor;