
import React, { useState, useEffect } from 'react';
import { Filter, Search, Clock, CheckCircle, X } from 'lucide-react';
import useDataStore from '../store/dataStore';
import toast from 'react-hot-toast';  
import { useDispatch, useSelector } from 'react-redux';
import { afterJoiningDataSlice } from '../redux/slice/afterJoiningWorkSlice';
import supabase from '../SupabaseClient';

const AfterJoiningWork = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    checkSalarySlipResume: false,
    offerLetterReceived: false,
    welcomeMeeting: false,
    biometricAccess: false,
    officialEmailId: false,
    emailId: "",
    emailPassword: "",
    assignAssets: false,
    laptopImage: null,
    laptopImageUrl: "",
    mobileImage: null,
    mobileImageUrl: "",
    vehicleImage: null,
    vehicleImageUrl: "",
    otherImage: null,
    otherImageUrl: "",
    pfEsic: false,
    companyDirectory: false,
    manualImage: null,
    manualImageUrl: "",
    assets: [],
  });

    const {afterJoining,loading,error}=useSelector((state)=>state.afterjoin);
  const dispatch=useDispatch();
  useEffect(()=>{
    dispatch(afterJoiningDataSlice())


  },[dispatch])


  useEffect(() => {
  if (afterJoining && Array.isArray(afterJoining)) {
    const pending = afterJoining.filter(
      (item) => item.planned_date !== null && item.actual_date === null
    );

    const history = afterJoining.filter(
      (item) => item.planned_date !== null && item.actual_date !== null
    );

    setPendingData(pending);
    setHistoryData(history);
  }
}, [afterJoining]);


  // Google Drive folder ID for storing images
  const DRIVE_FOLDER_ID = "1Am4QdBpwOGyIawpmlxxVGy1Gv2sAOARU";

  // const fetchJoiningData = async () => {
  //   // setLoading(true);
  //   setTableLoading(true);
  //   // setError(null);

  //   try {
  //     const response = await fetch(
  //       "https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=JOINING&action=fetch"
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const result = await response.json();
  //     console.log("Raw JOINING API response:", result);

  //     if (!result.success) {
  //       throw new Error(
  //         result.error || "Failed to fetch data from JOINING sheet"
  //       );
  //     }

  //     const rawData = result.data || result;

  //     if (!Array.isArray(rawData)) {
  //       throw new Error("Expected array data not received");
  //     }

  //     const headers = rawData[5];
  //     const dataRows = rawData.length > 6 ? rawData.slice(6) : [];

  //     const getIndex = (headerName) => {
  //       const index = headers.findIndex(
  //         (h) =>
  //           h && h.toString().trim().toLowerCase() === headerName.toLowerCase()
  //       );
  //       return index;
  //     };

  //     const processedData = dataRows.map((row) => ({
  //       timestamp: row[getIndex("Timestamp")] || "",
  //       joiningNo: row[getIndex("SKA-Joining ID")] || "",
  //       indentNo: row[getIndex("Indent No")] || "",
  //       enquiryNo: row[getIndex("Enquiry No")] || "",
  //       candidateName: row[getIndex("Name As Per Aadhar")] || "",
  //       fatherName: row[getIndex("Father Name")] || "",
  //       dateOfJoining: row[getIndex("Date Of Joining")] || "",
  //       joiningPlace: row[getIndex("Joining Place")] || "",
  //       designation: row[getIndex("Designation")] || "",
  //       salary: row[getIndex("Department")] || "",
  //       aadharPhoto: row[getIndex("Aadhar Frontside Photo")] || "",
  //       panCard: row[getIndex("Pan card")] || "",
  //       candidatePhoto: row[getIndex("Candidate's Photo")] || "",
  //       currentAddress: row[getIndex("Current Address")] || "",
  //       addressAsPerAadhar: row[getIndex("Address As Per Aadhar Card")] || "",
  //       bodAsPerAadhar: row[getIndex("Date Of Birth As Per Aadhar Card")] || "",
  //       gender: row[getIndex("Gender")] || "",
  //       mobileNo: row[getIndex("Mobile No.")] || "",
  //       familyMobileNo: row[getIndex("Family Mobile No.")] || "",
  //       relationWithFamily:
  //         row[getIndex("Relationship With Family Person")] || "",
  //       pfId: row[getIndex("Past Pf Id No. (If Any)")] || "",
  //       accountNo: row[getIndex("Current Bank A.C No.")] || "",
  //       ifscCode: row[getIndex("Ifsc Code")] || "",
  //       branchName: row[getIndex("Branch Name")] || "",
  //       passbookPhoto: row[getIndex("Photo Of Front Bank Passbook")] || "",
  //       email: row[getIndex("Personal Email-Id")] || "",
  //       esicNo: row[getIndex("ESIC No (IF Any)")] || "",
  //       qualification: row[getIndex("Highest Qualification")] || "",
  //       pfEligible: row[getIndex("PF Eligible")] || "",
  //       esicEligible: row[getIndex("ESIC Eligible")] || "",
  //       companyName: row[getIndex("Joining Company Name")] || "",
  //       emailToBeIssue: row[getIndex("Email ID To Be Issue")] || "",
  //       issueMobile: row[getIndex("Issue Mobile")] || "",
  //       issueLaptop: row[getIndex("Issue Laptop")] || "",
  //       aadharNo: row[getIndex("Aadhar Card No")] || "",
  //       modeOfAttendance: row[getIndex("Mode Of Attendance")] || "",
  //       quaficationPhoto: row[getIndex("Quafication Photo")] || "",
  //       paymentMode: row[getIndex("Payment Mode")] || "",
  //       salarySlip: row[getIndex("Salary Slip")] || "",
  //       resumeCopy: row[getIndex("Resume Copy")] || "",
  //       plannedDate: row[getIndex("Planned Date")] || "",
  //       actual: row[getIndex("Actual")] || "",
  //     }));

  //     const pendingTasks = processedData.filter(
  //       (task) => task.plannedDate && !task.actual
  //     );
  //     console.log("Processed joining data:", processedData);
  //     setPendingData(pendingTasks);

  //     const historyTasks = processedData.filter(
  //       (task) => task.plannedDate && task.actual
  //     );
  //     setHistoryData(historyTasks);
  //   } catch (error) {
  //     console.error("Error fetching joining data:", error);
  //     // setError(error.message);
  //     toast.error(`Failed to load joining data: ${error.message}`);
  //   } finally {
  //     // setLoading(false);
  //     setTableLoading(false);
  //   }
  // };

  // Fetch previous assets data from Assets sheet
  const fetchAssetsData = async (employeeId) => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=Assets&action=fetch"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        // If Assets sheet doesn't exist or no data, return empty
        return null;
      }

      const data = result.data || result;
      if (!Array.isArray(data) || data.length < 2) {
        return null;
      }

      // Find the row with matching employee ID (column B, index 1)
      const matchingRow = data.find((row, index) => {
        if (index === 0) return false; // Skip header row
        return row[1]?.toString().trim() === employeeId?.toString().trim();
      });

      if (matchingRow) {
        return {
          emailId: matchingRow[3] || "",
          emailPassword: matchingRow[4] || "",
          laptopImageUrl: matchingRow[5] || "",
          mobileImageUrl: matchingRow[6] || "",
          vehicleImageUrl: matchingRow[7] || "",
          otherImageUrl: matchingRow[8] || "",
          manualImageUrl: matchingRow[9] || ""
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching assets data:", error);
      return null;
    }
  };

  // Upload image to Google Drive
  // const uploadImageToDrive = async (file, fileName) => {
  //   try {
  //     const reader = new FileReader();
  //     return new Promise((resolve, reject) => {
  //       reader.onload = async () => {
  //         try {
  //           const base64Data = reader.result;
  //           const response = await fetch(
  //             "https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec",
  //             {
  //               method: "POST",
  //               headers: {
  //                 "Content-Type": "application/x-www-form-urlencoded",
  //               },
  //               body: new URLSearchParams({
  //                 action: "uploadFile",
  //                 base64Data: base64Data,
  //                 fileName: fileName,
  //                 mimeType: file.type,
  //                 folderId: DRIVE_FOLDER_ID,
  //               }).toString(),
  //             }
  //           );

  //           const result = await response.json();
  //           if (result.success) {
  //             resolve(result.fileUrl);
  //           } else {
  //             reject(new Error(result.error || "Upload failed"));
  //           }
  //         } catch (error) {
  //           reject(error);
  //         }
  //       };
  //       reader.onerror = () => reject(new Error("Failed to read file"));
  //       reader.readAsDataURL(file);
  //     });
  //   } catch (error) {
  //     throw new Error(`Upload failed: ${error.message}`);
  //   }
  // };

  // useEffect(() => {
  //   fetchJoiningData();
  // }, []);

const handleAfterJoiningClick = async (item) => {
  // Reset form data
  setFormData({
    checkSalarySlipResume: false,
    offerLetterReceived: false,
    welcomeMeeting: false,
    biometricAccess: false,
    officialEmailId: false,
    emailId: "",
    emailPassword: "",
    assignAssets: false,
    laptopImage: null,
    laptopImageUrl: "",
    mobileImage: null,
    mobileImageUrl: "",
    vehicleImage: null,
    vehicleImageUrl: "",
    otherImage: null,
    otherImageUrl: "",
    pfEsic: false,
    companyDirectory: false,
    manualImage: null,
    manualImageUrl: "",
    assets: [],
  });

  setSelectedItem(item);
  setShowModal(true);

  try {
    // 1. Fetch data from joining table (checkboxes)
    const { data: joiningData, error: joiningError } = await supabase
      .from("joining")
      .select(`
        check_salary_slip_resume,
        offer_letter_received,
        welcome_meeting,
        biometric_access,
        official_email_id,
        assign_assets,
        pf_esic,
        company_directory
      `)
      .eq("joining_no", item.joining_no)
      .maybeSingle();

    if (joiningError) {
      console.error("Error fetching joining data:", joiningError);
      return;
    }

    // 2. Fetch data from assets table (email, images, etc.)
    const { data: assetsData, error: assetsError } = await supabase
      .from("assets")
      .select(`
        email_id,
        email_password,
        laptop,
        mobile,
        vehicle,
        sim,
        mannual
      `)
      .eq("employee_id", item.joining_no)
      .maybeSingle();

    if (assetsError) {
      console.error("Error fetching assets data:", assetsError);
    }

    // Map Yes/No → booleans from joining table
    const currentValues = {
      checkSalarySlipResume: joiningData?.check_salary_slip_resume?.toLowerCase() === "yes",
      offerLetterReceived: joiningData?.offer_letter_received?.toLowerCase() === "yes",
      welcomeMeeting: joiningData?.welcome_meeting?.toLowerCase() === "yes",
      biometricAccess: joiningData?.biometric_access?.toLowerCase() === "yes",
      officialEmailId: joiningData?.official_email_id?.toLowerCase() === "yes",
      assignAssets: joiningData?.assign_assets?.toLowerCase() === "yes",
      pfEsic: joiningData?.pf_esic?.toLowerCase() === "yes",
      companyDirectory: joiningData?.company_directory?.toLowerCase() === "yes",
      
      // Get values from assets table
      emailId: assetsData?.email_id || "",
      emailPassword: assetsData?.email_password || "",
      laptopImageUrl: assetsData?.laptop || "",
      mobileImageUrl: assetsData?.mobile || "",
      vehicleImageUrl: assetsData?.vehicle || "",
      otherImageUrl: assetsData?.sim || "",
      manualImageUrl: assetsData?.mannual || "",
    };

    // Merge into formData
    setFormData((prev) => ({
      ...prev,
      ...currentValues,
    }));

  } catch (err) {
    console.error("Unexpected error:", err);
    toast.error("Failed to load current values");
  }
};

    const handleCheckboxChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  // Save assets data to Assets sheet
  const saveAssetsData = async (employeeId, employeeName, assetsData) => {
    try {
      const now = new Date();
      const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const rowData = [
        timestamp,
        employeeId,
        employeeName,
        assetsData.emailId || "",
        assetsData.emailPassword || "",
        assetsData.laptopImageUrl || "",
        assetsData.mobileImageUrl || "",
        assetsData.vehicleImageUrl || "",
        assetsData.otherImageUrl || "",
        assetsData.manualImageUrl || ""
      ];

      // First, check if record exists
      const existingData = await fetchAssetsData(employeeId);
      
      if (existingData) {
        // Update existing record - find the row and update it
        const fetchResponse = await fetch(
          "https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=Assets&action=fetch"
        );
        const result = await fetchResponse.json();
        const data = result.data || result;
        
        const rowIndex = data.findIndex((row, index) => {
          if (index === 0) return false; // Skip header
          return row[1]?.toString().trim() === employeeId?.toString().trim();
        });

        if (rowIndex !== -1) {
          // Update existing row
          const response = await fetch(
            "https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                sheetName: "Assets",
                action: "update",
                rowIndex: (rowIndex + 1).toString(),
                rowData: JSON.stringify(rowData),
              }).toString(),
            }
          );
          return await response.json();
        }
      }
      
      // Insert new record
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            sheetName: "Assets",
            action: "insert",
            rowData: JSON.stringify(rowData),
          }).toString(),
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to save assets data: ${error.message}`);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  if (!selectedItem || !selectedItem.joining_no) {
    toast.error("Employee not selected or joiningNo missing!");
    setSubmitting(false);
    return;
  }

  try {
    // 🔹 Helper function to upload a file into a joining_no folder
    const uploadFile = async (file, type) => {
      if (!file) return null;
      try {
        const fileExt = file.name.split(".").pop();
        const filePath = `${selectedItem.joining_no}/${type}_${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
          .from("AfterJoiningData")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (error) {
          console.error(`Upload error for ${type}:`, error);
          return null;
        }

        const { data: urlData } = supabase.storage
          .from("AfterJoiningData")
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      } catch (uploadError) {
        console.error(`Upload failed for ${type}:`, uploadError);
        return null;
      }
    };

    // 🔹 Upload all images in parallel
    const [laptopUrl, mobileUrl, vehicleUrl, otherUrl, manualUrl] =
      await Promise.all([
        formData.laptopImage
          ? uploadFile(formData.laptopImage, "laptop")
          : Promise.resolve(formData.laptopImageUrl),
        formData.mobileImage
          ? uploadFile(formData.mobileImage, "mobile")
          : Promise.resolve(formData.mobileImageUrl),
        formData.vehicleImage
          ? uploadFile(formData.vehicleImage, "vehicle")
          : Promise.resolve(formData.vehicleImageUrl),
        formData.otherImage
          ? uploadFile(formData.otherImage, "other")
          : Promise.resolve(formData.otherImageUrl),
        formData.manualImage
          ? uploadFile(formData.manualImage, "manual")
          : Promise.resolve(formData.manualImageUrl),
      ]);

    console.log("Uploaded Image URLs:", {
      laptop: laptopUrl,
      mobile: mobileUrl,
      vehicle: vehicleUrl,
      sim: otherUrl,
      manual: manualUrl,
    });

    // 🔹 Build only non-empty asset data
    const buildAssetsData = () => {
      const data = {
        employee_id: selectedItem.joining_no,
        employee_name: selectedItem.name_as_per_aadhar,
      };
      if (formData.emailId) data.email_id = formData.emailId;
      if (formData.emailPassword) data.email_password = formData.emailPassword;
      if (laptopUrl) data.laptop = laptopUrl;
      if (mobileUrl) data.mobile = mobileUrl;
      if (vehicleUrl) data.vehicle = vehicleUrl;
      if (otherUrl) data.sim = otherUrl;
      if (manualUrl) data.mannual = manualUrl;
      return data;
    };

    const assetsData = buildAssetsData();

    let assetsResult = null;

    // 🔹 Check if row already exists for this employee
    const { data: existingAsset } = await supabase
      .from("assets")
      .select("id") // or employee_id if that's PK
      .eq("employee_id", selectedItem.joining_no)
      .maybeSingle();

    if (!existingAsset) {
      // No row → Insert new
      const { data, error } = await supabase
        .from("assets")
        .insert([assetsData])
        .select();
      if (error) console.error("Assets insert error:", error);
      assetsResult = data;
    } else {
      // Row found → Update only provided fields
      const { data, error } = await supabase
        .from("assets")
        .update(assetsData)
        .eq("employee_id", selectedItem.joining_no)
        .select();
      if (error) console.error("Assets update error:", error);
      assetsResult = data;
    }

    console.log("Assets upsert result:", assetsResult);

    // 🔹 Prepare final data for joining table
    const finalData = {
      check_salary_slip_resume: formData.checkSalarySlipResume ? "Yes" : "No",
      offer_letter_received: formData.offerLetterReceived ? "Yes" : "No",
      welcome_meeting: formData.welcomeMeeting ? "Yes" : "No",
      biometric_access: formData.biometricAccess ? "Yes" : "No",
      official_email_id: formData.officialEmailId ? "Yes" : "No",
      assign_assets: formData.assignAssets ? "Yes" : "No",
      pf_esic: formData.pfEsic ? "Yes" : "No",
      company_directory: formData.companyDirectory ? "Yes" : "No",
    };

    const allYes = Object.values(finalData).every((val) => val === "Yes");
    if (allYes) {
      finalData.actual_date = new Date().toISOString();
    }

    const { data: joiningUpdate, error: joiningError } = await supabase
      .from("joining")
      .update(finalData)
      .eq("joining_no", selectedItem.joining_no)
      .select();

    if (joiningError) {
      console.error("Joining update error:", joiningError);
      throw new Error(`Failed to update joining data: ${joiningError.message}`);
    }

    console.log("Joining updated:", joiningUpdate);

    toast.success(
      allYes
        ? "All conditions met! Data saved successfully with completion date."
        : "Data saved successfully!"
    );

    setShowModal(false);
    
    // 🔹 Refresh data from backend - dispatch the Redux action
    dispatch(afterJoiningDataSlice());
    
  } catch (error) {
    console.error("Error:", error);
    toast.error(`Operation failed: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};


const formatDOB = (dateString) => {
  if (!dateString) return "";

  // Handle the format "2021-11-01"
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const day = parts[2];
      const month = parts[1];
      const year = parts[0].slice(-2); // Get last 2 digits of year
      return `${day}/${month}/${year}`;
    }
  }

  // Fallback for other formats
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-indexed, so add 1
  const year = date.getFullYear().toString().slice(-2);

  return `${day}/${month}/${year}`;
};

  const filteredPendingData = pendingData.filter((item) => {
    const matchesSearch =
      item.name_as_per_aadhar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.joining_no?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredHistoryData = historyData.filter((item) => {
    const matchesSearch =
      item.name_as_per_aadhar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.joining_no?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold  ">After Joining Work</h1>
      </div>

      <div className="bg-white  p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search Something..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300   rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white   text-gray-500    "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2  text-gray-500  "
            />
          </div>
        </div>
      </div>

      <div className="bg-white  rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-300  ">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              <Clock size={16} className="inline mr-2" />
              Pending ({filteredPendingData.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <CheckCircle size={16} className="inline mr-2" />
              History ({filteredHistoryData.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "pending" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKA-Joining ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Father Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Of Joining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                          <span className="text-gray-600 text-sm">
                            Loading pending calls...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <p className="text-red-500">Error: {error}</p>
                        <button
                          onClick={afterJoiningDataSlice()}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredPendingData.length > 0 ? (
                    filteredPendingData.map((item, index) => (
                      <tr key={index} className="hover:bg-white">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleAfterJoiningClick(item)}
                            className="px-3 py-1 bg-indigo-700 text-white rounded-md text-sm"
                          >
                            Process
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.joining_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.name_as_per_aadhar}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.father_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDOB(item.date_of_joining)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.designation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.department}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <p className="text-gray-500">
                          No pending after joining work found.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "history" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y   divide-white  ">
                <thead className="bg-gray-100  ">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">
                      Date Of Joining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y   divide-white  ">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                          <span className="text-gray-600 text-sm">
                            Loading call history...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredHistoryData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No call history found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryData.map((item, index) => (
                      <tr key={index} className="hover:bg-white hover: ">
                        <td className="px-6 py-4 whitespace-nowrap text-sm  text-gray-500">
                          {item.joining_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm  text-gray-500">
                          {item.name_as_per_aadhar}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm  text-gray-500">
                          {item.designation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDOB(item.date_of_joining)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm  text-gray-500">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500 font-semibold  text-white">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {filteredHistoryData.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className=" text-gray-500  ">
                    No after joining work history found.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && selectedItem && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-500">
                After Joining Work Checklist
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={selectedItem.joining_no}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedItem.name_as_per_aadhar}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-500">
                  Checklist Items
                </h4>

                {[
                  {
                    key: "checkSalarySlipResume",
                    label: "Check Salary Slip & Resume Copy",
                  },
                  {
                    key: "offerLetterReceived",
                    label: "Offer Letter Received",
                  },
                  { key: "welcomeMeeting", label: "Welcome Meeting" },
                  { key: "biometricAccess", label: "Biometric Access" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={formData[item.key]}
                      onChange={() => handleCheckboxChange(item.key)}
                      className="h-4 w-4 text-gray-500 focus:ring-blue-500 border-gray-300 rounded bg-white"
                    />
                    <label
                      htmlFor={item.key}
                      className="ml-2 text-sm text-gray-500"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}

                {/* Official Email ID Section */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="officialEmailId"
                      checked={formData.officialEmailId}
                      onChange={() => handleCheckboxChange("officialEmailId")}
                      className="h-4 w-4 text-gray-500 focus:ring-blue-500 border-gray-300 rounded bg-white"
                    />
                    <label
                      htmlFor="officialEmailId"
                      className="ml-2 text-sm text-gray-500"
                    >
                      Official Email ID
                    </label>
                  </div>
                  
                  {formData.officialEmailId && (
                    <div className="mt-2 ml-6 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Email ID
                        </label>
                        <input
                          type="text"
                          name="emailId"
                          value={formData.emailId}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Enter email ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          name="emailPassword"
                          value={formData.emailPassword}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Enter password"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Assign Assets Section */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="assignAssets"
                      checked={formData.assignAssets}
                      onChange={() => handleCheckboxChange("assignAssets")}
                      className="h-4 w-4 text-gray-500 focus:ring-blue-500 border-gray-300 rounded bg-white"
                    />
                    <label
                      htmlFor="assignAssets"
                      className="ml-2 text-sm text-gray-500"
                    >
                      Assign Assets
                    </label>
                  </div>
                  
                  {formData.assignAssets && (
                    <div className="mt-2 ml-6 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-md">
                      {[
                        { id: "laptopImage", label: "Laptop", urlKey: "laptopImageUrl" },
                        { id: "mobileImage", label: "Mobile", urlKey: "mobileImageUrl" },
                        { id: "vehicleImage", label: "Vehicle", urlKey: "vehicleImageUrl" },
                        { id: "otherImage", label: "Other", urlKey: "otherImageUrl" },
                      ].map((asset) => (
                        <div key={asset.id} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-500">
                            {asset.label}
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="file"
                                id={asset.id}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, asset.id)}
                                className="hidden"
                              />
                              <label
                                htmlFor={asset.id}
                                className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                {formData[asset.id] ? 'Change' : (formData[asset.urlKey] ? 'Replace' : 'Upload')}
                              </label>
                            </div>
                            {/* Show existing image if available */}
                            {formData[asset.urlKey] && !formData[asset.id] && (
                              <div className="mt-1">
                                <img 
                                  src={formData[asset.urlKey]} 
                                  alt={`Existing ${asset.label}`} 
                                  className="h-16 w-16 object-cover rounded border"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Current {asset.label} image</p>
                              </div>
                            )}
                            {/* Show new selected image preview */}
                            {formData[asset.id] && (
                              <div className="mt-1">
                                <img 
                                  src={URL.createObjectURL(formData[asset.id])} 
                                  alt={`New ${asset.label}`} 
                                  className="h-16 w-16 object-cover rounded border" 
                                />
                                <p className="text-xs text-green-600 mt-1">New {asset.label} image selected</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pfEsic"
                    checked={formData.pfEsic}
                    onChange={() => handleCheckboxChange("pfEsic")}
                    className="h-4 w-4 text-gray-500 focus:ring-blue-500 border-gray-300 rounded bg-white"
                  />
                  <label
                    htmlFor="pfEsic"
                    className="ml-2 text-sm text-gray-500"
                  >
                    PF / ESIC
                  </label>
                </div>

                {/* Company Directory Section */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="companyDirectory"
                      checked={formData.companyDirectory}
                      onChange={() => handleCheckboxChange("companyDirectory")}
                      className="h-4 w-4 text-gray-500 focus:ring-blue-500 border-gray-300 rounded bg-white"
                    />
                    <label
                      htmlFor="companyDirectory"
                      className="ml-2 text-sm text-gray-500"
                    >
                      Company Directory
                    </label>
                  </div>
                  
                  {formData.companyDirectory && (
                    <div className="mt-2 ml-6 p-3 bg-gray-50 rounded-md">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-500">
                          Manual
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="file"
                              id="manualImage"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "manualImage")}
                              className="hidden"
                            />
                            <label
                              htmlFor="manualImage"
                              className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              {formData.manualImage ? 'Change Manual' : (formData.manualImageUrl ? 'Replace Manual' : 'Upload Manual')}
                            </label>
                          </div>
                          {/* Show existing manual image if available */}
                          {formData.manualImageUrl && !formData.manualImage && (
                            <div className="mt-2">
                              <img 
                                src={formData.manualImageUrl} 
                                alt="Existing Manual" 
                                className="h-32 w-full object-contain rounded border"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <p className="text-xs text-gray-500 mt-1">Current manual image</p>
                            </div>
                          )}
                          {/* Show new selected manual image preview */}
                          {formData.manualImage && (
                            <div className="mt-2">
                              <img 
                                src={URL.createObjectURL(formData.manualImage)} 
                                alt="New Manual" 
                                className="h-32 w-full object-contain rounded border" 
                              />
                              <p className="text-xs text-green-600 mt-1">New manual image selected</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white bg-indigo-700 rounded-md hover:bg-indigo-800 min-h-[42px] flex items-center justify-center ${
                    submitting ? "opacity-90 cursor-not-allowed" : ""
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AfterJoiningWork;