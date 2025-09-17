
import supabase from "../../SupabaseClient";



export const postFindEnquiryApi = async (rowData) => {
  try {
    // Step 1: Insert into enquiry (get candidate_enquiry_no from trigger)
    const { data: enquiryData, error: enquiryError } = await supabase
      .from("enquiry")
      .insert([
        {
          indent_no: rowData.indentNo,
          applying_for_the_post: rowData.applyingForPost,
          candidate_name: rowData.candidateName,
          candidate_dob: rowData.candidateDOB,
          candidate_phone_no: rowData.candidatePhone,
          candidate_email: rowData.candidateEmail,
          previous_company_name: rowData.previousCompany || "",
          job_experience: rowData.jobExperience || "",
          last_salary_drawn: rowData.lastSalary || "",
          previous_position: rowData.previousPosition || "",
          reason_of_leaving_previous_company: rowData.reasonForLeaving || "",
          marital_status: rowData.maritalStatus || "",
          last_employee_mobile_no: rowData.lastEmployerMobile || "",
          refrence_by: rowData.referenceBy || "",
          present_address: rowData.presentAddress || "",
          aadhar_no: rowData.aadharNo || "",
          planned: rowData.planned || null,
          actual: rowData.actual || null,
        },
      ])
      .select(); // returns inserted row (including candidate_enquiry_no)

    if (enquiryError) {
      console.error("Error inserting enquiry:", enquiryError);
      return null;
    }

    const enquiryRow = enquiryData[0];
    const enquiryNo = enquiryRow.candidate_enquiry_no; // ENQ-01, ENQ-02 etc.

    console.log("Enquiry inserted successfully:", enquiryRow);

    // Step 2: Upload files to Supabase Storage
    const bucket = "Candidate_enquiry";

    let candidatePhotoUrl = "";
    let resumeCopyUrl = "";

    // Upload candidate photo
    if (rowData.candidatePhoto) {
      const { data: photoData, error: photoError } = await supabase.storage
        .from(bucket)
        .upload(
          `${enquiryNo}/photo_${Date.now()}.jpg`,
          rowData.candidatePhoto,
          { contentType: "image/jpeg", upsert: true }
        );

      if (photoError) {
        console.error("Error uploading photo:", photoError);
      } else {
        candidatePhotoUrl = supabase.storage
          .from(bucket)
          .getPublicUrl(photoData.path).data.publicUrl;
      }
    }

    // Upload resume copy
    if (rowData.resumeCopy) {
      const { data: resumeData, error: resumeError } = await supabase.storage
        .from(bucket)
        .upload(
          `${enquiryNo}/resume_${Date.now()}.pdf`,
          rowData.resumeCopy,
          { contentType: "application/pdf", upsert: true }
        );

      if (resumeError) {
        console.error("Error uploading resume:", resumeError);
      } else {
        resumeCopyUrl = supabase.storage
          .from(bucket)
          .getPublicUrl(resumeData.path).data.publicUrl;
      }
    }

    // Step 3: Update enquiry row with URLs
    if (candidatePhotoUrl || resumeCopyUrl) {
      const { error: updateError } = await supabase
        .from("enquiry")
        .update({
          candidate_photo: candidatePhotoUrl,
          resume_copy: resumeCopyUrl,
        })
        .eq("candidate_enquiry_no", enquiryNo); // ✅ use correct column name

      if (updateError) {
        console.error("Error updating enquiry with file URLs:", updateError);
      } else {
        console.log("Enquiry updated with file URLs successfully");
      }
    }

    // Step 4: If status is Complete, update indent table
    // if (rowData.status === "Complete") {
    //   const now = new Date();
    //   const formattedDate = now.toISOString().split("T")[0];

    //   const { error: indentError } = await supabase
    //     .from("indent")
    //     .update({
    //       status: "Complete",
    //       actual: formattedDate,
    //     })
    //     .eq("indent_no", rowData.indentNo);

    //   if (indentError) {
    //     console.error("Error updating indent:", indentError);
    //   } else {
    //     console.log("Indent updated successfully");
    //   }
    // }

    return enquiryRow;
  } catch (error) {
    console.error("Error from Supabase:", error);
    return null;
  }
};





export const fetchIndentDataforEnquiry = async () => {
  try {
    const { data, error } = await supabase
      .from('indent')
      .select('*')
      .not("planned","is","null")
      .is("actual",null)
      .eq("status","NeedMore")
       .order("timestamp", { ascending: true }); 

    if (error) {
      console.log("Error when fetching data", error);
      
    }

else{
 console.log("fetch data successfully", data);
}
   
    return data;

  } catch (error) {
    console.log("Error from Supabase", error);
   
  }
};

export const fetchEnquiryData = async () => {
  try {
    const { data, error } = await supabase
      .from('enquiry')
      .select('*')
      .not("planned","is","null")
      .is("actual",null)
       .order("timestamp", { ascending: true }); 

    if (error) {
      console.log("Error when fetching data", error);
      
    }

else{
 console.log("fetch data successfully", data);
}
   
    return data;

  } catch (error) {
    console.log("Error from Supabase", error);
   
  }
};
