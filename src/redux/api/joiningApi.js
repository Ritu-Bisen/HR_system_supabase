import supabase from "../../SupabaseClient";


export const fetchJoiningDataApi = async () => {
  try {
    // 1️⃣ Get all enquiry numbers from follow_up with status 'Joining'
    const { data: followUpData, error: followUpError } = await supabase
      .from('follow_up')
      .select('enquiry_no, status, candidate_says')
      .eq('status', 'Joining');

    if (followUpError) {
      console.error("Error fetching follow_up data:", followUpError);
      return [];
    }

    const enquiryNumbers = followUpData.map(item => item.enquiry_no);

    if (enquiryNumbers.length === 0) return [];

    // 2️⃣ Fetch matching enquiries
    const { data: enquiryData, error: enquiryError } = await supabase
      .from('enquiry')
      .select('*')
      .not("planned1","is",null)
      .is("actual1",null)
      .in('candidate_enquiry_no',enquiryNumbers);

    if (enquiryError) {
      console.error("Error fetching enquiry data:", enquiryError);
      return [];
    }

    // Optionally attach follow-up data manually
    const result = enquiryData.map(enquiry => ({
      ...enquiry,
      follow_up: followUpData.filter(f => f.enquiry_no === enquiry.candidate_enquiry_no)
    }));

    console.log("Fetched joining enquiries:", result);
    return result;
  } catch (error) {
    console.error("Error from Supabase:", error);
    return [];
  }
};




export const postJoiningDataApi = async (rowData) => {
  try {
    // ✅ Step 1: Insert into joining table (trigger generates joining_no)
    const { data: joiningData, error: joiningError } = await supabase
      .from("joining")
      .insert([
        {
          timestamp: rowData.timestamp,
          name_as_per_aadhar: rowData.candidate_name,
          father_name: rowData.father_name,
          date_of_joining: rowData.date_of_joining,
          designation: rowData.designation,
          current_address: rowData.present_address,
          date_of_birth: rowData.candidate_dob,
          gender: rowData.gender,
          mobile_no: rowData.candidate_phone,
          family_mobile_no: rowData.family_mobile_no,
          relationship_with_family_person: rowData.relationship_with_family,
          current_bank_account_no: rowData.bank_account_no,
          ifsc_code: rowData.ifsc_code,
          branch_name: rowData.branch_name,
          aadhar_no: rowData.aadhar_no,
          candidate_email: rowData.candidate_email,
          department:rowData.department,
        },
      ])
      .select();

    if (joiningError) {
      console.error("❌ Error inserting joining:", joiningError);
      return null;
    }

    const joiningRow = joiningData[0];
    const joiningNo = joiningRow.joining_no; // ✅ Trigger-generated

    console.log("✅ Joining inserted successfully:", joiningRow);

    // ✅ Step 2: Upload files (Aadhar + Bank Passbook)
    const bucket = "joining_image";
    let aadharUrl = "";
    let bankPassbookUrl = "";

    if (rowData.aadhar_card_url) {
      const { data: aadharData, error: aadharError } = await supabase.storage
        .from(bucket)
        .upload(
          `${joiningNo}/aadhar_${Date.now()}.jpg`,
          rowData.aadhar_card_url,
          { contentType: rowData.aadhar_card_url.type, upsert: true }
        );
      if (!aadharError) {
        aadharUrl = supabase.storage
          .from(bucket)
          .getPublicUrl(aadharData.path).data.publicUrl;
      }
    }

    if (rowData.bank_passbook_url) {
      const { data: bankData, error: bankError } = await supabase.storage
        .from(bucket)
        .upload(
          `${joiningNo}/bank_passbook_${Date.now()}.jpg`,
          rowData.bank_passbook_url,
          { contentType: rowData.bank_passbook_url.type, upsert: true }
        );
      if (!bankError) {
        bankPassbookUrl = supabase.storage
          .from(bucket)
          .getPublicUrl(bankData.path).data.publicUrl;
      }
    }

    // ✅ Step 3: Update joining row with URLs
    if (aadharUrl || bankPassbookUrl) {
      await supabase
        .from("joining")
        .update({
          aadhar_frontside_photo: aadharUrl,
          bank_passbook_url: bankPassbookUrl,
        })
        .eq("joining_no", joiningNo);
    }

    // ✅ Step 4: Update enquiry table with today's date in actual1
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    const { error: enquiryError } = await supabase
      .from("enquiry")
      .update({ actual1: today })
      .eq("candidate_enquiry_no", rowData.candidate_enquiry_no); // <-- Adjust column for linking

    if (enquiryError) {
      console.error("❌ Error updating enquiry.actual1:", enquiryError);
    } else {
      console.log("✅ Enquiry updated with actual1 =", today);
    }

    return { ...joiningRow, aadharUrl, bankPassbookUrl };
  } catch (error) {
    console.error("❌ Error from Supabase:", error);
    return null;
  }
};
