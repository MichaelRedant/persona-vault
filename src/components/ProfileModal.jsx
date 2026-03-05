// src/components/ProfileModal.jsx
import { useEffect, useState } from 'react';
import { FiLogOut, FiX, FiDownload, FiPlus } from 'react-icons/fi';
import Button from './Button';
import TagAnalyticsWithBadges from './TagAnalyticsWithBadges';
import OnboardingChecklist from './OnboardingChecklist';
import Input from './Input';
import { getApiBaseUrl } from '../api/client';

const API_BASE_URL = getApiBaseUrl();

export default function ProfileModal({
  token,
  decodedToken,
  onLogout,
  onClose,
  promptCount,
  personaCount,
  favoriteCount,
  tagsUsed,
  promptsWithoutTagCount,
  onNewPrompt,
  onNewPersona,
  onExport,
  personas, // ✅ toegevoegd
  prompts   // ✅ toegevoegd
}) {
  const { username, email, iat } = decodedToken || {};

  const [activeTab, setActiveTab] = useState('overview');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [role, setRole] = useState('');
  const [photo, setPhoto] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Fetch stored profile info from API
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/profile_get.php`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.profile) {
          setName(data.profile.profile_name || username || '');
          setAddress(data.profile.address || '');
          setProfileEmail(data.profile.email || email || '');
          setRole(data.profile.role || '');
          setPhoto(data.profile.photo || '');
        }
      } catch {
        setError('Failed to load profile');
      }
    }
    if (token) {
      loadProfile();
    }
  }, [token, username, email]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString() || '';
      setPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/profile_update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          address,
          email: profileEmail,
          role,
          photo,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      localStorage.setItem('vault_onboard_completedProfile', '1');
      setActiveTab('overview');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Failed to save profile');
    }
  };

  // ✅ Auto-mark onboarding stappen op basis van je data
  useEffect(() => {
    try {
      if (name || profileEmail) {
        localStorage.setItem('vault_onboard_completedProfile', '1');
      }
      if (Number(personaCount) > 0) {
        localStorage.setItem('vault_onboard_createdPersona', '1');
      }
      if (Number(promptCount) > 0) {
        localStorage.setItem('vault_onboard_createdPrompt', '1');
      }
    } catch {
      /* ignore */
    }
  }, [name, profileEmail, personaCount, promptCount]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full text-left space-y-6 relative animate-scale-in border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile modal"
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <FiX className="text-xl" aria-hidden="true" />
        </button>

        {/* Profile header with avatar */}
        <div className="flex items-center space-x-4">
          {photo ? (
            <img
              src={photo}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-600">
              {(name || username || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {name || username || 'Unknown'}
            </h3>
            {(profileEmail || email) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profileEmail || email}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-4 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`pb-2 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('overview')}
            type="button"
          >
            Overview
          </button>
          <button
            className={`pb-2 text-sm font-medium ${
              activeTab === 'edit'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('edit')}
            type="button"
          >
            Edit profile
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Activity */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <div className="uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                Activity
              </div>
              <div className="grid grid-cols-2 gap-y-1">
                <div>Personas:</div>
                <div className="text-right">{personaCount}</div>

                <div>Prompts:</div>
                <div className="text-right">{promptCount}</div>

                <div>Favorites:</div>
                <div className="text-right">{favoriteCount}</div>

                <div>Unique tags:</div>
                <div className="text-right">{tagsUsed}</div>

                <div>Prompts without tag:</div>
                <div className="text-right">{promptsWithoutTagCount}</div>
              </div>
            </div>

            {/* Tag analytics */}
            <TagAnalyticsWithBadges personas={personas} prompts={prompts} topN={5} />

            {/* ✅ Onboarding checklist (verdwijnt bij 100%) */}
            <OnboardingChecklist onCreateClick={onNewPrompt} />

            {/* Session info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                Session info
              </div>
              {iat && <p>Logged in at: {new Date(iat * 1000).toLocaleString()}</p>}
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <Button variant="primary" onClick={onNewPersona}>
                <FiPlus className="mr-2" />
                New persona
              </Button>

              <Button variant="primary" onClick={onNewPrompt}>
                <FiPlus className="mr-2" />
                New prompt
              </Button>

              <Button variant="outline" onClick={onExport}>
                <FiDownload className="mr-2" />
                Export all
              </Button>

              <Button variant="danger" onClick={onLogout}>
                <FiLogOut className="mr-2" />
                Log out
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="pt-4 space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input
              label="Email"
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
            />
            <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
            <div className="flex flex-col space-y-1">
              <label htmlFor="profile-photo-input" className="font-semibold text-sm">Photo</label>
              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 transition"
              />
              {photo && (
                <img
                  src={photo}
                  alt="Preview"
                  className="mt-2 w-20 h-20 rounded-full object-cover"
                />
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </form>
        )}

        {/* Animations */}
        <style jsx="true">{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
