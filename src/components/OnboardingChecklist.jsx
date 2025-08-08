import { useState, useEffect } from 'react';
import Tooltip from './Tooltip';

const defaultTasks = [
  { key: 'completedProfile', label: 'Complete your profile', hint: 'Add your personal details and avatar.' },
  { key: 'createdPersona',   label: 'Create your first persona', hint: 'Build a persona to tailor prompts.' },
  { key: 'createdPrompt',    label: 'Create your first prompt',  hint: 'Store prompts to reuse them quickly.' },
  { key: 'invitedTeammate',  label: 'Invite a teammate',         hint: 'Collaborate by inviting colleagues to your workspace.' },
  { key: 'exploredTemplates',label: 'Explore template library',  hint: 'Discover ready-made prompt templates.' }
];

export default function OnboardingChecklist({ onCreateClick }) {
  const [tasks, setTasks] = useState(defaultTasks);

  useEffect(() => {
    setTasks(prev =>
      prev.map(t => ({ ...t, done: localStorage.getItem(`vault_onboard_${t.key}`) === '1' }))
    );
  }, []);

  const markDone = (key) => {
    localStorage.setItem(`vault_onboard_${key}`, '1');
    setTasks(prev => prev.map(t => t.key === key ? { ...t, done: true } : t));
  };

  const progress = Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);
  if (progress === 100) return null;

  return (
    <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold">Getting started</p>
        <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
      </div>

      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-500 rounded" style={{ width: `${progress}%` }} />
      </div>

      {onCreateClick && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onCreateClick}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            + Create Prompt
          </button>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {tasks.map(task => (
          <li key={task.key} className="flex items-center justify-between">
            <Tooltip text={task.hint}>
              <span className={task.done ? 'line-through text-gray-400' : ''}>{task.label}</span>
            </Tooltip>
            {!task.done && (
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => markDone(task.key)}
              >
                Mark done
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
