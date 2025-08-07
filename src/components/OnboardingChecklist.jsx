import { useState, useEffect } from 'react';

const defaultTasks = [
  { key: 'completedProfile', label: 'Complete your profile' },
  { key: 'createdPersona', label: 'Create your first persona' },
  { key: 'createdPrompt', label: 'Create your first prompt' }
];

export default function OnboardingChecklist() {
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
      <p className="mb-2 font-semibold">Getting started</p>
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-500 rounded" style={{ width: `${progress}%` }}></div>
      </div>
      <ul className="mt-4 space-y-2">
        {tasks.map(task => (
          <li key={task.key} className="flex items-center justify-between">
            <span className={task.done ? 'line-through text-gray-400' : ''}>{task.label}</span>
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
