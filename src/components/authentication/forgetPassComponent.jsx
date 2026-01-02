import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../CustomTextField";
import { useNavigate } from "react-router-dom";

import bg from "../../assets/bg-image.png";
import taukLogo from "../../assets/Tauk-Logo.svg";
import leftArrow from "../../assets/left-arrow.svg";
import CustomButton from "../CustomButton";

export default function ForgetPassComponent() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: (values) => {
      console.log("Password reset request:", values);
      // API
      navigate("/check-email", { state: { email: values.email } });
    },
  });

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-x-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Logo */}
      <div className="absolute top-5 left-5">
        <img
          src={taukLogo}
          alt="Logo"
          className="h-[50px] sm:h-[66px] w-auto"
        />
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-[20px] sm:rounded-[28px] px-6 sm:px-8 md:px-10 py-8 sm:py-12 w-full max-w-sm sm:max-w-md lg:max-w-[480px]">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 mb-1 hover:text-blue-600 cursor-pointer"
        >
          <img src={leftArrow} alt="Back" className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-[18px] sm:text-[14px] md:text-[16px] font-semibold mb-1">
          Forgot password?
        </h2>
        <p className="text-sm sm:text-base text-neutral mb-6 sm:mb-8">
          Enter your email address to get password reset link
        </p>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <CustomTextField
            name="email"
            type="email"
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : ""}
          />

          {/* Submit button */}
          <CustomButton
            type="submit"
            fullWidth={true}
            className="mt-6 !text-[16px]"
            position="center"
          >
            Get Link
          </CustomButton>
        </form>
      </div>
    </div>
  );
}
