import supabase from "../../SupabaseClient";

export const fetchAfterJoiningData = async () => {
  try {
    const { data, error } = await supabase
      .from('joining')
      .select('*')
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

export const postAfterJoiningDataApi = async (rowData) => {
  try {
    // ✅ Check if all fields are "Yes"
    const allYes =
      rowData.check_salary_slip_resume === "Yes" &&
      rowData.offer_letter_received === "Yes" &&
      rowData.welcome_meeting === "Yes" &&
      rowData.biometric_access === "Yes" &&
      rowData.official_email_id === "Yes" &&
      rowData.assign_assets === "Yes" &&
      rowData.pf_esic === "Yes" &&
      rowData.company_directory === "Yes";

    // ✅ Build the update object (use DB column names exactly)
    const updateData = {
      check_salary_slip_resume : rowData.check_salary_slip_resume,
      offer_letter_received: rowData.offer_letter_received,
      welcome_meeting: rowData.welcome_meeting,
      biometric_access: rowData.biometric_access,
      official_email_id: rowData.official_email_id,
      assign_assets: rowData.assign_assets,
      pf_esic: rowData.pf_esic,
      company_directory: rowData.company_directory,
    };

    // ✅ Add "actual_date" only if allYes
    if (allYes) {
      updateData.actual_date = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    }

    // ✅ Update existing row instead of inserting
    const { data, error } = await supabase
      .from("joining")
      .update(updateData)
      .eq("joining_no", rowData.joining_no)  // match on joining_no
      .select();

    if (error) {
      console.error("❌ Error updating joining:", error);
      return null;
    }

    console.log("✅ Update successful:", data);
    return data;
  } catch (error) {
    console.error("❌ Error from Supabase:", error);
    return null;
  }
};

