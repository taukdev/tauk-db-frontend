import React from "react";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../../CustomTextField"; // adjust path
import { createPlatformNote } from "../../../features/platform/platformNotesSlice";
import CustomButton from "../../CustomButton";

export default function AddPlatformNotes({ platformId }) {
  const dispatch = useDispatch();

  //  Yup validation schema
  const validationSchema = Yup.object({
    message: Yup.string().trim().required("Message is required"),
  });

  //  Formik setup
  const formik = useFormik({
    initialValues: {
      message: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(createPlatformNote({
          id: platformId,
          payload: { note_text: values.message }
        })).unwrap();
        resetForm();
      } catch (error) {
        console.error("Failed to post note:", error);
      }
    },
  });

  return (
    <div className="bg-white rounded-custom-lg border border-[#E1E3EA] shadow-sm">
      {/* Header */}
      <h2 className="text-md text-primary-dark font-bold p-4">Add New Note</h2>
      <hr className="border-t border-[#F1F1F4]" />

      {/* Form */}
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col gap-3 px-6 pb-4 pt-3"
      >
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
          position="end"
          className=""
        >
          Post Note
        </CustomButton>
      </form>
    </div>
  );
}
