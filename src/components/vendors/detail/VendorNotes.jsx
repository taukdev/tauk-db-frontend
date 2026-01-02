import React from "react";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import DangerCircleIcon from "../../../assets/icons/DangerCircle-icon.svg";
import CustomTextField from "../../CustomTextField"; // adjust path
import CustomButton from "../../CustomButton";

export default function VendorNotes() {
  const dispatch = useDispatch();

  // Yup validation schema
  const validationSchema = Yup.object({
    message: Yup.string()
      .trim()
      .required("Message is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      message: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      // Dispatch action here with values.message
      console.log("Submitted:", values.message);
      // dispatch(yourAction(values.message));
      resetForm();
    },
  });

  return (
    <div className="bg-white rounded-custom-lg border border-[#E1E3EA] shadow-sm">
      <h2 className="text-md text-primary-dark font-bold p-4">Notes</h2>
      <hr className="border-t border-[#F1F1F4] mb-2" />

      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col gap-3 px-6 pb-4 pt-"
      >
        {/* Info Row */}
        <div className="flex gap-2 items-center">
          <img
            src={DangerCircleIcon}
            alt="Danger Icon"
            className="w-4 h-4 mt-0.5"
          />
          <p className="text-justify text-sm text-gray-500">
            You haven't entered any notes for this vendor.
          </p>
        </div>

        <CustomTextField
          isTextArea
          name="message"
          placeholder="Write message here"
          value={formik.values.message}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.message && formik.errors.message}
          size="md"
        />
        
          <CustomButton
            type="submit"
            fullWidth={false}
            position="end"
          >
            Post Note
          </CustomButton>
        
      </form>
    </div>
  );
}
