'use client';

import { useState, useEffect, useRef } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common';
import { User, Mail, Phone, Lock, Camera, Loader2, Eye, EyeOff, Calendar, MapPin, Briefcase, Award, Users } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile, UpdateProfileData, ChangePasswordData } from '@/types/profile';
import { getMyProfile, updateProfile, changePassword, uploadProfilePhoto } from '@/lib/profile-api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<UpdateProfileData>({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [studentData, setStudentData] = useState({
    dateOfBirth: '',
    parentContact: '',
    emergencyContact: '',
    address: '',
  });

  const [parentData, setParentData] = useState({
    relationshipToStudent: '',
    occupation: '',
  });

  const [coachData, setCoachData] = useState({
    certifications: '',
    specialization: '',
    yearsOfExperience: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setProfileData({
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
      });

      if (data.role === 'STUDENT' && data.studentProfile) {
        setStudentData({
          dateOfBirth: data.studentProfile.dateOfBirth || '',
          parentContact: data.studentProfile.parentContact || '',
          emergencyContact: data.studentProfile.emergencyContact || '',
          address: data.studentProfile.address || '',
        });
      }

      if (data.role === 'PARENT' && data.parentProfile) {
        setParentData({
          relationshipToStudent: data.parentProfile.relationshipToStudent || '',
          occupation: data.parentProfile.occupation || '',
        });
      }

      if (data.role === 'COACH' && data.coachProfile) {
        setCoachData({
          certifications: data.coachProfile.certifications || '',
          specialization: data.coachProfile.specialization || '',
          yearsOfExperience: data.coachProfile.yearsOfExperience || '',
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.phoneNumber?.startsWith('+62')) {
      toast.error('Phone number must start with +62');
      return;
    }

    try {
      setUpdating(true);
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
      if (profileData.email !== profile?.email) {
        toast.info('Email change requires admin approval. Your account status is now Pending.');
      }
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordData);
      toast.success('Password changed successfully');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    if (!file.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
      toast.error('Only JPG, JPEG, PNG, and GIF images are allowed');
      return;
    }

    try {
      setUploadingPhoto(true);
      await uploadProfilePhoto(file);
      toast.success('Profile photo updated successfully');
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Text>Failed to load profile</Text>
      </div>
    );
  }

  const photoUrl = profile.photo_url
    ? `${apiUrl}${profile.photo_url}`
    : null;

  const initials = profile.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="space-y-6">
      <Title>Account Settings</Title>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-6">
          <div className="relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={profile.fullName}
                className="size-24 rounded-full border-2 border-gray-300 object-cover dark:border-gray-700"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadingPhoto ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {profile.fullName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Role: {profile.role}
            </p>
            {profile.status && profile.status !== 'Active' && (
              <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                Status: {profile.status}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Personal Information
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Changing email requires admin approval
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) =>
                  setProfileData({ ...profileData, phoneNumber: e.target.value })
                }
                placeholder="+62812345678"
                className="pl-10"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Must start with +62
            </p>
          </div>

          {profile.role === 'STUDENT' && (
            <>
              <h4 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-50">
                Student Information
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    value={studentData.dateOfBirth}
                    onChange={(e) =>
                      setStudentData({ ...studentData, dateOfBirth: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Parent Contact
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="tel"
                    value={studentData.parentContact}
                    onChange={(e) =>
                      setStudentData({ ...studentData, parentContact: e.target.value })
                    }
                    placeholder="+62812345678"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emergency Contact
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="tel"
                    value={studentData.emergencyContact}
                    onChange={(e) =>
                      setStudentData({ ...studentData, emergencyContact: e.target.value })
                    }
                    placeholder="+62812345678"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 size-4 text-gray-400" />
                  <textarea
                    value={studentData.address}
                    onChange={(e) =>
                      setStudentData({ ...studentData, address: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50"
                  />
                </div>
              </div>
            </>
          )}

          {profile.role === 'PARENT' && (
            <>
              <h4 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-50">
                Parent Information
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Relationship to Student
                </label>
                <div className="relative mt-1">
                  <Users className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={parentData.relationshipToStudent}
                    onChange={(e) =>
                      setParentData({ ...parentData, relationshipToStudent: e.target.value })
                    }
                    placeholder="e.g., Father, Mother, Guardian"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Occupation
                </label>
                <div className="relative mt-1">
                  <Briefcase className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={parentData.occupation}
                    onChange={(e) =>
                      setParentData({ ...parentData, occupation: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          {profile.role === 'COACH' && (
            <>
              <h4 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-50">
                Coach Information
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Certifications
                </label>
                <div className="relative mt-1">
                  <Award className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={coachData.certifications}
                    onChange={(e) =>
                      setCoachData({ ...coachData, certifications: e.target.value })
                    }
                    placeholder="e.g., Level 1 Coach, First Aid Certified"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specialization
                </label>
                <div className="relative mt-1">
                  <Award className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={coachData.specialization}
                    onChange={(e) =>
                      setCoachData({ ...coachData, specialization: e.target.value })
                    }
                    placeholder="e.g., Youth Development, Advanced Techniques"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Years of Experience
                </label>
                <div className="relative mt-1">
                  <Briefcase className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    value={coachData.yearsOfExperience}
                    onChange={(e) =>
                      setCoachData({ ...coachData, yearsOfExperience: e.target.value })
                    }
                    min="0"
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          <Button type="submit" isLoading={updating} loadingText="Saving...">
            Save Changes
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Change Password
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Old Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showOldPassword ? 'text' : 'password'}
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, oldPassword: e.target.value })
                }
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Minimum 6 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={changingPassword}
            loadingText="Updating..."
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
