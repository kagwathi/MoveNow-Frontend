'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/common/Toast';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Input, Select, Textarea } from '@/components/common/FormInput';
import Modal from '@/components/common/Modal';
import {
  CogIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  ServerIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      booking_alerts: true,
      driver_alerts: true,
      system_alerts: true,
    },
    security: {
      two_factor_enabled: false,
      session_timeout: 30,
      password_expiry: 90,
      failed_login_attempts: 5,
    },
    system: {
      maintenance_mode: false,
      api_rate_limiting: true,
      debug_mode: false,
      log_level: 'info',
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [systemStats, setSystemStats] = useState(null);

  const toast = useToast();

  const tabs = [
    {
      id: 'profile',
      name: 'Profile',
      icon: UserCircleIcon,
      description: 'Manage your admin profile and account information',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Configure notification preferences and alerts',
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Security settings and access controls',
    },
    {
      id: 'system',
      name: 'System',
      icon: ServerIcon,
      description: 'System configuration and maintenance',
    },
  ];

  useEffect(() => {
    loadAdminData();
    loadSystemStats();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch the current admin's profile
      // For now, we'll simulate with stored data or API call
      const mockProfile = {
        id: '1',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@movenow.com',
        phone: '+254700000000',
        role: 'admin',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      setAdminProfile(mockProfile);
      setProfileForm({
        first_name: mockProfile.first_name,
        last_name: mockProfile.last_name,
        email: mockProfile.email,
        phone: mockProfile.phone,
      });
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error('Load admin data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      const response = await adminAPI.getSystemStats();
      if (response.data.success) {
        setSystemStats(response.data.data);
      }
    } catch (error) {
      console.error('Load system stats error:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      // In a real app, you'd call the API to update profile
      // await adminAPI.updateProfile(profileForm);

      toast.success('Profile updated successfully');
      setAdminProfile((prev) => ({
        ...prev,
        ...profileForm,
      }));
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      // In a real app, you'd call the API to change password
      // await adminAPI.changePassword(passwordForm);

      toast.success('Password changed successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false,
      });
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Change password error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const saveSettings = async (category) => {
    try {
      setSaving(true);
      // In a real app, you'd call the API to save settings
      // await adminAPI.updateSettings({ [category]: settings[category] });

      toast.success(
        `${
          category.charAt(0).toUpperCase() + category.slice(1)
        } settings saved successfully`
      );
    } catch (error) {
      toast.error(`Failed to save ${category} settings`);
      console.error(`Save ${category} settings error:`, error);
    } finally {
      setSaving(false);
    }
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Profile Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="First Name"
            value={profileForm.first_name}
            onChange={(e) =>
              setProfileForm((prev) => ({
                ...prev,
                first_name: e.target.value,
              }))
            }
          />
          <Input
            label="Last Name"
            value={profileForm.last_name}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))
            }
          />
          <Input
            label="Email Address"
            type="email"
            value={profileForm.email}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <Input
            label="Phone Number"
            value={profileForm.phone}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </div>

        <button
          onClick={handleProfileUpdate}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              <span>Update Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Change Password
        </h3>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Input
              label="Current Password"
              type={passwordForm.showCurrent ? 'text' : 'password'}
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  current_password: e.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() =>
                setPasswordForm((prev) => ({
                  ...prev,
                  showCurrent: !prev.showCurrent,
                }))
              }
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {passwordForm.showCurrent ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              label="New Password"
              type={passwordForm.showNew ? 'text' : 'password'}
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  new_password: e.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() =>
                setPasswordForm((prev) => ({ ...prev, showNew: !prev.showNew }))
              }
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {passwordForm.showNew ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              type={passwordForm.showConfirm ? 'text' : 'password'}
              value={passwordForm.confirm_password}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirm_password: e.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() =>
                setPasswordForm((prev) => ({
                  ...prev,
                  showConfirm: !prev.showConfirm,
                }))
              }
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {passwordForm.showConfirm ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={
            saving ||
            !passwordForm.current_password ||
            !passwordForm.new_password ||
            !passwordForm.confirm_password
          }
          className="btn-primary flex items-center space-x-2"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Changing...</span>
            </>
          ) : (
            <>
              <KeyIcon className="h-4 w-4" />
              <span>Change Password</span>
            </>
          )}
        </button>
      </div>

      {/* Account Information */}
      {adminProfile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Account Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">
                Account Created
              </span>
              <p className="text-sm text-gray-900">
                {formatDate(adminProfile.created_at, 'MMMM dd, yyyy')}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Last Login
              </span>
              <p className="text-sm text-gray-900">
                {formatDate(adminProfile.last_login, 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Role</span>
              <p className="text-sm text-gray-900 capitalize">
                {adminProfile.role}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Account ID
              </span>
              <p className="text-sm text-gray-900 font-mono">
                {adminProfile.id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Notification Preferences
          </h3>
          <button
            onClick={() => saveSettings('notifications')}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {/* Communication Channels */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Communication Channels
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email_notifications}
                    onChange={(e) =>
                      handleSettingChange(
                        'notifications',
                        'email_notifications',
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      SMS Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive notifications via SMS
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms_notifications}
                    onChange={(e) =>
                      handleSettingChange(
                        'notifications',
                        'sms_notifications',
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BellIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Push Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive browser push notifications
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push_notifications}
                    onChange={(e) =>
                      handleSettingChange(
                        'notifications',
                        'push_notifications',
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Alert Types */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Alert Types
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Booking Alerts</p>
                  <p className="text-sm text-gray-600">
                    New bookings, cancellations, and updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.booking_alerts}
                    onChange={(e) =>
                      handleSettingChange(
                        'notifications',
                        'booking_alerts',
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Driver Alerts</p>
                  <p className="text-sm text-gray-600">
                    Driver registrations, approvals, and issues
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.driver_alerts}
                    onChange={(e) =>
                      handleSettingChange(
                        'notifications',
                        'driver_alerts',
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">System Alerts</p>
                  <p className="text-sm text-gray-600">
                    System errors, maintenance, and updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.system_alerts}
                    onChange={(e) =>
                      handleSettingChange(
                        'notifications',
                        'system_alerts',
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Security Settings
          </h3>
          <button
            onClick={() => saveSettings('security')}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.two_factor_enabled}
                  onChange={(e) =>
                    handleSettingChange(
                      'security',
                      'two_factor_enabled',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {settings.security.two_factor_enabled && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  Two-factor authentication is enabled. You&apos;ll need to
                  verify your identity with a second factor when logging in.
                </p>
              </div>
            )}
          </div>

          {/* Session Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.security.session_timeout}
                onChange={(e) =>
                  handleSettingChange(
                    'security',
                    'session_timeout',
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Automatically log out after this period of inactivity
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={settings.security.password_expiry}
                onChange={(e) =>
                  handleSettingChange(
                    'security',
                    'password_expiry',
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Require password change after this many days
              </p>
            </div>
          </div>

          {/* Login Security */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Failed Login Attempts Limit
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.security.failed_login_attempts}
              onChange={(e) =>
                handleSettingChange(
                  'security',
                  'failed_login_attempts',
                  parseInt(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              Account will be temporarily locked after this many failed attempts
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const SystemTab = () => (
    <div className="space-y-6">
      {/* System Status */}
      {systemStats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            System Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  System Online
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                All services operational
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ServerIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  API Version
                </span>
              </div>
              <p className="text-sm font-bold text-blue-900 mt-1">
                {systemStats.system_info?.api_version || '1.0.0'}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  Environment
                </span>
              </div>
              <p className="text-sm font-bold text-purple-900 mt-1 capitalize">
                {systemStats.system_info?.environment || 'Production'}
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Server Time:</strong>{' '}
              {formatDate(
                systemStats.system_info?.server_time,
                'MMMM dd, yyyy HH:mm:ss'
              )}
            </p>
          </div>
        </div>
      )}

      {/* System Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            System Configuration
          </h3>
          <button
            onClick={() => saveSettings('system')}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-600">
                Temporarily disable public access to the platform
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.system.maintenance_mode}
                onChange={(e) =>
                  handleSettingChange(
                    'system',
                    'maintenance_mode',
                    e.target.checked
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {settings.system.maintenance_mode && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Maintenance Mode Active
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    The platform is currently in maintenance mode. Users will
                    see a maintenance page instead of the normal interface.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Rate Limiting */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">API Rate Limiting</h4>
              <p className="text-sm text-gray-600">
                Protect the API from abuse and excessive usage
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.system.api_rate_limiting}
                onChange={(e) =>
                  handleSettingChange(
                    'system',
                    'api_rate_limiting',
                    e.target.checked
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Debug Mode */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Debug Mode</h4>
              <p className="text-sm text-gray-600">
                Enable detailed error logging and debugging information
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.system.debug_mode}
                onChange={(e) =>
                  handleSettingChange('system', 'debug_mode', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          {settings.system.debug_mode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Debug Mode Enabled
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Detailed error information will be logged. Disable this in
                    production for security.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Log Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Level
            </label>
            <Select
              value={settings.system.log_level}
              onChange={(e) =>
                handleSettingChange('system', 'log_level', e.target.value)
              }
              options={[
                { value: 'error', label: 'Error - Only log errors' },
                { value: 'warn', label: 'Warning - Log warnings and errors' },
                { value: 'info', label: 'Info - Log general information' },
                { value: 'debug', label: 'Debug - Log everything (verbose)' },
              ]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher levels include all lower level logs. Debug level can impact
              performance.
            </p>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          System Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Clear Cache</h4>
            <p className="text-sm text-gray-600 mb-3">
              Clear system cache to ensure fresh data is loaded
            </p>
            <button className="btn-secondary w-full">Clear System Cache</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Export Logs</h4>
            <p className="text-sm text-gray-600 mb-3">
              Download system logs for analysis or debugging
            </p>
            <button className="btn-secondary w-full">Download Logs</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Database Backup</h4>
            <p className="text-sm text-gray-600 mb-3">
              Create a backup of the current database
            </p>
            <button className="btn-secondary w-full">Create Backup</button>
          </div>

          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h4 className="font-medium text-red-900 mb-2">Restart System</h4>
            <p className="text-sm text-red-600 mb-3">
              Restart all system services (causes brief downtime)
            </p>
            <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Restart System
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'security':
        return <SecurityTab />;
      case 'system':
        return <SystemTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Settings
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your account, notifications, security, and system settings
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {tabs.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">{renderTabContent()}</div>
      </div>
    </div>
  );
}
