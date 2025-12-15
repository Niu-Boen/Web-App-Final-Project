import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState, AppDispatch } from '../store/store';
import { fetchProfile, logout } from '../store/slices/authSlice';
import FileUpload from '../components/FileUpload';
import { User, CreditCard, Settings, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

interface ProfileForm {
  name: string;
  email: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileForm>();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordForm>();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const handleAvatarUpload = (imageUrl: string, imagePath: string) => {
    // Avatar is automatically updated in the backend
    dispatch(fetchProfile());
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsUpdating(true);
    try {
      const response = await api.put('/profile', data);
      if (response.data.success) {
        dispatch(fetchProfile());
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      setIsUpdating(true);
      const response = await api.post('/change-password', data);
      toast.success(response.data.message || 'Password changed successfully');
      resetPassword();
      setShowPasswordForm(false);
      
      // If the response indicates re-login is required, logout the user
      if (response.data.requires_relogin) {
        setTimeout(() => {
          dispatch(logout());
          toast.info('Please login again with your new password');
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setIsUpdating(true);
      const response = await api.post('/enable-2fa');
      setTwoFactorSecret(response.data.data.secret);
      setShow2FASetup(true);
      toast.success('2FA enabled successfully');
      await dispatch(fetchProfile());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt('Please enter your password to disable 2FA:');
    if (!password) return;

    try {
      setIsUpdating(true);
      await api.post('/disable-2fa', { password });
      toast.success('2FA disabled successfully');
      setShow2FASetup(false);
      setTwoFactorSecret('');
      await dispatch(fetchProfile());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'profile', name: 'Profile', icon: User },
                { id: 'account', name: 'Account', icon: CreditCard },
                { id: 'security', name: 'Security', icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} className="mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
                <div className="flex flex-col items-center">
                  <FileUpload
                    type="avatar"
                    currentImage={user.avatar ? `http://localhost:8000/storage/${user.avatar}` : undefined}
                    onUploadSuccess={handleAvatarUpload}
                    className="mb-4"
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Upload a profile picture. Recommended size: 200x200px
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={user.student_id}
                      disabled
                      className="input bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Student ID cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        }
                      })}
                      type="text"
                      className="input"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <input
                      type="text"
                      value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                      disabled
                      className="input bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Gender cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      disabled
                      className="input bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current Balance</h4>
                <div className="text-3xl font-bold text-primary-600">
                  ฿{parseFloat(user.account_balance.toString()).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Available for purchases
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Account Status</h4>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Member Since</dt>
                  <dd className="text-gray-900">
                    {new Date(user.created_at || '').toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Last Login</dt>
                  <dd className="text-gray-900">
                    {user.last_login_at 
                      ? new Date(user.last_login_at).toLocaleString()
                      : 'Never'
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password Change Section */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Password</h3>
              <p className="text-sm text-gray-600 mb-4">
                Change your password to keep your account secure.
              </p>
              
              {!showPasswordForm ? (
                <button 
                  onClick={() => setShowPasswordForm(true)}
                  className="btn btn-secondary"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      {...registerPassword('current_password', {
                        required: 'Current password is required'
                      })}
                      type="password"
                      className="input"
                    />
                    {passwordErrors.current_password && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.current_password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      {...registerPassword('new_password', {
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      type="password"
                      className="input"
                    />
                    {passwordErrors.new_password && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      {...registerPassword('new_password_confirmation', {
                        required: 'Please confirm your new password'
                      })}
                      type="password"
                      className="input"
                    />
                    {passwordErrors.new_password_confirmation && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password_confirmation.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      {isUpdating ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        resetPassword();
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2FA Section */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add an extra layer of security to your account with two-factor authentication.
              </p>
              
              {user?.two_factor_enabled ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="text-green-500" size={20} />
                    <span className="text-green-600 font-medium">2FA is enabled</span>
                  </div>
                  <button
                    onClick={handleDisable2FA}
                    disabled={isUpdating}
                    className="btn btn-secondary"
                  >
                    {isUpdating ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnable2FA}
                  disabled={isUpdating}
                  className="btn btn-primary"
                >
                  {isUpdating ? 'Enabling...' : 'Enable 2FA'}
                </button>
              )}

              {show2FASetup && twoFactorSecret && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Important: Save Your 2FA Secret</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Please save this secret code in a secure location. You'll need it to generate 2FA codes:
                  </p>
                  <div className="bg-white p-3 rounded border font-mono text-lg text-center">
                    {twoFactorSecret}
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    This is a simplified 2FA implementation. In production, use a proper authenticator app.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

