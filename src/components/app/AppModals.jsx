import { lazy, Suspense, useEffect, useState } from 'react';
import ConfirmDialog from '../ConfirmDialog';
import Modal from '../Modal';

const AdminPanelModal = lazy(() => import('../AdminPanelModal'));
const PersonaForm = lazy(() => import('../PersonaForm'));
const ProfileModal = lazy(() => import('../ProfileModal'));
const SettingsModal = lazy(() => import('../SettingsModal'));

function AppModals({
  isProfileModalOpen,
  decodedToken,
  token,
  personaCount,
  personas,
  prompts,
  promptCount,
  favoriteCount,
  promptsWithoutTagCount,
  tagsUsed,
  onLogout,
  onCloseProfile,
  onNewPrompt,
  onNewPersona,
  isSettingsModalOpen,
  compactMode,
  setCompactMode,
  onCloseSettings,
  isAdminPanelOpen,
  onCloseAdminPanel,
  onToast,
  isPersonaModalOpen,
  editingPersona,
  onClosePersonaModal,
  onSavePersona,
  collections,
}) {
  const [hasUnsavedPersonaChanges, setHasUnsavedPersonaChanges] = useState(false);
  const [showDiscardPersonaConfirm, setShowDiscardPersonaConfirm] = useState(false);

  useEffect(() => {
    if (!isPersonaModalOpen) {
      setHasUnsavedPersonaChanges(false);
      setShowDiscardPersonaConfirm(false);
    }
  }, [isPersonaModalOpen]);

  const closePersonaModal = ({ discardDraft = false } = {}) => {
    if (discardDraft) {
      localStorage.removeItem('vault_draft_persona');
    }
    setHasUnsavedPersonaChanges(false);
    setShowDiscardPersonaConfirm(false);
    onClosePersonaModal?.();
  };

  const requestClosePersonaModal = () => {
    if (hasUnsavedPersonaChanges) {
      setShowDiscardPersonaConfirm(true);
      return;
    }

    closePersonaModal();
  };

  return (
    <>
      {isProfileModalOpen && decodedToken && (
        <Suspense fallback={null}>
          <ProfileModal
            token={token}
            decodedToken={decodedToken}
            personaCount={personaCount}
            personas={personas}
            prompts={prompts}
            promptCount={promptCount}
            favoriteCount={favoriteCount}
            promptsWithoutTagCount={promptsWithoutTagCount}
            tagsUsed={tagsUsed}
            onLogout={onLogout}
            onClose={onCloseProfile}
            onNewPrompt={onNewPrompt}
            onNewPersona={onNewPersona}
            onExport={() => {
              const data = { personas, prompts };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'vault_export.json';
              link.click();
              URL.revokeObjectURL(url);
            }}
          />
        </Suspense>
      )}

      {isSettingsModalOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            onClose={onCloseSettings}
            compactMode={compactMode}
            setCompactMode={setCompactMode}
          />
        </Suspense>
      )}

      {isAdminPanelOpen && (
        <Suspense fallback={null}>
          <AdminPanelModal
            isOpen={isAdminPanelOpen}
            onClose={onCloseAdminPanel}
            token={token}
            onToast={onToast}
          />
        </Suspense>
      )}

      {isPersonaModalOpen && editingPersona && (
        <Modal isOpen={isPersonaModalOpen} onClose={requestClosePersonaModal}>
          <Suspense fallback={null}>
            <PersonaForm
              key={editingPersona ? editingPersona.id : 'new'}
              onSave={onSavePersona}
              initialData={editingPersona}
              collections={collections}
              onDirtyChange={setHasUnsavedPersonaChanges}
            />
          </Suspense>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDiscardPersonaConfirm}
        onClose={() => setShowDiscardPersonaConfirm(false)}
        onConfirm={() => closePersonaModal({ discardDraft: true })}
        title="Discard unsaved persona changes?"
        description="Your unsaved changes will be lost if you close this form."
      />
    </>
  );
}

export default AppModals;
