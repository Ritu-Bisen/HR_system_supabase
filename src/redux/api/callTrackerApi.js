import supabase from "../../SupabaseClient";

export const fetchEnquiryDataApi = async () => {
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



export const postFollowUpDataApi = async (rowData) => {
  try {
    // 1️⃣ Insert follow-up data
    const { data, error } = await supabase
      .from("follow_up")
      .insert(rowData) // rowData already has enquiry_no, status, etc.
      .select();

    if (error) {
      console.log("Error when posting follow-up data:", error);
      return null;
    }

    console.log("Follow-up inserted successfully:", data);

    // 2️⃣ If status is joining or reject → update enquiry.actual
    if (
      rowData.status.toLowerCase() === "joining" ||
      rowData.status.toLowerCase() === "reject"
    ) {
      const today = new Date().toISOString().split("T")[0];

      const { error: updateError } = await supabase
        .from("enquiry")
        .update({ actual: today })
        .eq("candidate_enquiry_no", rowData.enquiry_no);

      if (updateError) {
        console.error("Error updating enquiry.actual:", updateError);
      } else {
        console.log("Enquiry table updated with actual date:", today);
      }
    }

    return data;
  } catch (error) {
    console.error("Error from Supabase:", error);
    return null;
  }
};


export const fetchFollowUpHistoryApi = async () => {
  try {
    const { data, error } = await supabase
      .from('follow_up')
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