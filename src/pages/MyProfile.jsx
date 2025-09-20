import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Building, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import supabase from '../SupabaseClient';

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);




const fetchJoiningData = async () => {
  try {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      throw new Error("No user data found in localStorage");
    }

    const currentUser = JSON.parse(userData);
    const userName = currentUser.name?.trim().toLowerCase();

    // Fetch data directly from Supabase JOINING table
    const { data, error } = await supabase
      .from("joining")
      .select("*")
      .ilike("name_as_per_aadhar", userName) // case-insensitive match
      .maybeSingle(); // return single row if found

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      toast.error("No profile data found for current user");
      return;
    }

    // Build profile object directly from Supabase row
    const profile = {
      timestamp: data.timestamp,
      joiningNo: data.joining_no,
      candidateName: data.name_as_per_aadhar,
      candidatePhoto: data.candidate_photo,
      fatherName: data.father_name,
      dateOfJoining: data.date_of_joining,
      joiningPlace: data.branch_name, // Assuming joiningPlace = branch_name
      designation: data.designation,
      salary: data.department,
      currentAddress: data.current_address,
      addressAsPerAadhar: data.aadhar_frontside_photo, // adjust if different
      bodAsPerAadhar: data.date_of_birth,
      gender: data.gender,
      mobileNo: data.mobile_no,
      familyMobileNo: data.family_mobile_no,
      relationWithFamily: data.relationship_with_family,
      email: data.candidate_email,
      companyName: data.department,
      aadharNo: data.aadhar_no,
    };

    // Store in state + localStorage
    setProfileData(profile);
    setFormData(profile);
    localStorage.setItem("employeeId", profile.joiningNo);

  } catch (error) {
    console.error("Error fetching joining data:", error);
    toast.error(`Failed to load profile data: ${error.message}`);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchJoiningData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 

const handleSave = async () => {
  try {
    setLoading(true);

    if (!profileData?.joiningNo) {
      throw new Error("No employee ID found for current profile");
    }

    // 1. Build update object (only editable fields)
    const updateData = {
      mobile_no: formData.mobileNo || "",
      family_mobile_no: formData.familyMobileNo || "",
      candidate_email: formData.email || "",
      current_address: formData.currentAddress || "",
      // add more fields as needed, must match column names in Supabase
    };

    // 2. Update row in Supabase JOINING table
    const { data, error } = await supabase
      .from("joining")
      .update(updateData)
      .eq("joining_no", profileData.joiningNo) // find row by employee ID
      .select()
      .single(); // return the updated row

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Employee ${profileData.joiningNo} not found`);
    }

    // 3. Update local state only after successful DB update
    setProfileData(data);
    setFormData(data);
    toast.success("Profile updated successfully!");
    setIsEditing(false);

  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error(`Failed to update profile: ${error.message}`);
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
    setFormData(profileData || {});
    setIsEditing(false);
  };

  if (loading) {
    return <div className="page-content p-6"><div className="flex justify-center flex-col items-center">
                        <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-600 text-sm">Loading pending calls...</span>
                      </div></div>;
  }

  if (!profileData) {
    return <div className="page-content p-6">No profile data available</div>;
  }

  return (
    <div className="space-y-6 page-content p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Edit3 size={16} className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save size={16} className="mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {profileData.candidatePhoto ? (
                <img
                  src={profileData.candidatePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full flex items-center justify-center ${
                  profileData.candidatePhoto ? "hidden" : "flex"
                }`}
              >
                <User size={48} className="text-indigo-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {profileData.candidateName}
            </h2>
            <p className="text-gray-600">{profileData.designation}</p>
            <p className="text-sm text-gray-500">{profileData.joiningNo}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-6">
  <h3 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* First Column */}
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User size={16} className="inline mr-2" />
          Full Name
        </label>
        <p className="text-gray-800 font-medium">{profileData.candidateName}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building size={16} className="inline mr-2" />
          Designation
        </label>
        <p className="text-gray-800">{profileData.designation}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building size={16} className="inline mr-2" />
          Department
        </label>
        <p className="text-gray-800">{profileData.companyName}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar size={16} className="inline mr-2" />
          Date of Birth
        </label>
        <p className="text-gray-800">{profileData.bodAsPerAadhar}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <p className="text-gray-800">{profileData.gender}</p>
      </div>
    </div>

    {/* Second Column */}
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
        <p className="text-gray-800">{profileData.fatherName}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar size={16} className="inline mr-2" />
          Joining Date
        </label>
        <p className="text-gray-800">{profileData.dateOfJoining}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail size={16} className="inline mr-2" />
          Email Address
        </label>
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <p className="text-gray-800">{profileData.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone size={16} className="inline mr-2" />
          Phone Number
        </label>
        {isEditing ? (
          <input
            type="tel"
            name="mobileNo"
            value={formData.mobileNo || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <p className="text-gray-800">{profileData.mobileNo}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
        {isEditing ? (
          <input
            type="tel"
            name="familyMobileNo"
            value={formData.familyMobileNo || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <p className="text-gray-800">{profileData.familyMobileNo}</p>
        )}
      </div>
    </div>
  </div>
  
  {/* Current Address - Full width below the two columns */}
  <div className="mt-6 pt-6 border-t border-gray-200">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      <MapPin size={16} className="inline mr-2" />
      Current Address
    </label>
    {isEditing ? (
      <textarea
        name="currentAddress"
        value={formData.currentAddress || ''}
        onChange={handleInputChange}
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    ) : (
      <p className="text-gray-800 whitespace-pre-line">{profileData.currentAddress}</p>
    )}
  </div>
</div>
      </div>
    </div>
  );
};

export default MyProfile;