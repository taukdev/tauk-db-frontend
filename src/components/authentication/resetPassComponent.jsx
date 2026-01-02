import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../CustomTextField";
import { useNavigate } from "react-router-dom";

import bg from "../../assets/bg-image.png";
import taukLogo from "../../assets/Tauk-Logo.svg";
import leftArrow from "../../assets/left-arrow.svg";
import CustomButton from "../CustomButton";

export default function ResetPassComponent() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
      remember: false,
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: (values) => {
      navigate("/");
    },
  });

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-center flex overflow-x-hidden items-center justify-center relative p-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="flex mb-3 absolute top-5 w-full left-5">
        <img src={taukLogo} alt="Logo" className="h-[66px] w-[122px]" />
      </div>

      <div className="bg-white shadow-md rounded-[28px]  px-10 py-12 w-full max-w-md lg:max-w-[480px]">
        <button
          onClick={() => navigate("/forgot-password")}
          className="flex items-center text-gray-600 mb-1 hover:text-blue-600 cursor-pointer"
        >
          <img src={leftArrow} alt="Back" />
        </button>

        <h2 className="text-[14px] lg:text-[18px] md:text-[16px] sm:text-[14px] text-primary-dark font-semibold mb-1">
          Reset Password
        </h2>
        <p className="text-md text-neutral mb-6">
          Create a new password for your account
        </p>

        <form onSubmit={formik.handleSubmit}>
          <CustomTextField
            name="password"
            type="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password ? formik.errors.password : ""}
          />

          {/* Confirm Password */}
          <CustomTextField
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirmPassword
                ? formik.errors.confirmPassword
                : ""
            }
          />

          {/* Remember me */}
          <div className="flex items-center mt-5">
            <input
              type="checkbox"
              name="remember"
              checked={formik.values.remember}
              onChange={formik.handleChange}
              className="mr-2 "
            />
            <label className="text-gray-700 text-smd">Remember me</label>
          </div>

          {/* Submit */}
          <CustomButton
            type="submit"
            fullWidth={true}
            className="mt-12 !text-[16px]"
            position="center"
          >
            Set Password
          </CustomButton>
        </form>
      </div>
    </div>
  );
}
