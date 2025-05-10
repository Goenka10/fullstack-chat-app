import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [userData, setUserData] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  
  // Max file size in bytes (1MB is safer)
  const MAX_FILE_SIZE = 1 * 1024 * 1024;
  
  // Sync local state with auth store
  useEffect(() => {
    if (authUser) {
      setUserData(authUser);
    }
  }, [authUser]);

  // Function to compress image before upload
  const compressImage = (imageFile) => {
    return new Promise((resolve, reject) => {
      const maxWidth = 800;
      const maxHeight = 800;
      const quality = 0.7;
      const reader = new FileReader();
      
      reader.readAsDataURL(imageFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          resolve(compressedBase64);
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadError(null);
    
    if (!file.type.match('image.*')) {
      setUploadError('Please select an image file (JPEG, PNG, etc.)');
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.loading('Compressing image...');
      
      try {
        const compressedImage = await compressImage(file);
        setSelectedImg(compressedImage);
        
        // Only send the profilePic, not the entire user object
        await updateProfile({ profilePic: compressedImage });
        
        toast.dismiss();
        toast.success('Profile picture updated successfully');
      } catch (error) {
        toast.dismiss();
        console.error("Failed to compress and upload image:", error);
        setUploadError('Failed to process image. Please try a smaller file.');
        toast.error('Failed to process image');
      }
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const base64Image = reader.result;
          setSelectedImg(base64Image);
          
          // Only send the profilePic, not the entire user object
          await updateProfile({ profilePic: base64Image });
          
          toast.success('Profile picture updated successfully');
        } catch (error) {
          console.error("Failed to update profile picture:", error);
          setUploadError("Failed to upload image. Please try again.");
          toast.error("Failed to upload image");
        }
      };
      
      reader.onerror = () => {
        setUploadError("Error reading file. Please try again.");
        toast.error("Error reading file");
      };
    }
  };
  
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-indigo-600">My Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account information</p>
          </div>
          
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <label 
                htmlFor="avatar-upload" 
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 cursor-pointer block"
              >
                <img
                  src={selectedImg || (userData.profilePic) || "/avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/avatar.png";
                  }}
                />
                
                <div className={`
                  absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100
                  flex items-center justify-center transition-opacity
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}>
                  <Camera className="h-10 w-10 text-white" />
                </div>
              </label>
              
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </div>
            
            {uploadError ? (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span>{uploadError}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {isUpdatingProfile ? "Uploading..." : "Click on the image to change your profile picture"}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Images will be automatically compressed if needed
            </p>
          </div>
          
          {/* User Information */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={userData?.fullName || ''}
                  className="px-4 py-2.5 bg-gray-100 rounded-lg border w-full text-gray-700"
                  readOnly
                />
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-500">Your name cannot be changed</p>
            </div>
            
            <div className="space-y-1.5">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={userData?.email || ''}
                  className="px-4 py-2.5 bg-gray-100 rounded-lg border w-full text-gray-700"
                  readOnly
                />
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-500">Your email address cannot be changed</p>
            </div>
          </div>
          
          {/* Account Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Member Since</span>
                <span className="text-gray-900">
                  {userData?.createdAt 
                    ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "Not available"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Account Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;