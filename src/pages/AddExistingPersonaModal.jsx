import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Button from '../components/Button';

export default function AddExistingPersonaModal({
  isOpen,
  onClose,
  personas,
  collectionId,
  onAssignPersonasToCollection,
}) {
  const [selectedPersonaIds, setSelectedPersonaIds] = useState([]);

  // Reset selectie bij open/close modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedPersonaIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter personas → exclude personas die al in deze collection zitten
  const availablePersonas = personas.filter(
    (p) => Number(p.collection_id) !== Number(collectionId)
  );

  const handleCheckboxChange = (personaId) => {
    setSelectedPersonaIds((prev) =>
      prev.includes(personaId)
        ? prev.filter((id) => id !== personaId)
        : [...prev, personaId]
    );
  };

  const handleAssign = () => {
    if (selectedPersonaIds.length > 0) {
      onAssignPersonasToCollection(selectedPersonaIds);
      setSelectedPersonaIds([]);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-lg w-full text-left space-y-6 relative animate-scale-in border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <FiX className="text-xl" />
        </button>

        {/* Modal title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Add Existing Personas to Collection
        </h3>

        {/* List of personas */}
        {availablePersonas.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No available personas to add.
          </p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-gray-600 rounded p-2 space-y-2">
            {availablePersonas.map((persona) => (
              <div
                key={persona.id}
                className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selectedPersonaIds.includes(persona.id)}
                  onChange={() => handleCheckboxChange(persona.id)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>{persona.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedPersonaIds.length === 0}
          >
            Assign to Collection
          </Button>
        </div>

        {/* Animations */}
        <style jsx="true">{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
