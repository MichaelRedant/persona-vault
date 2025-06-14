export default function Badge({ text }) {
  return (
    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
      {text}
    </span>
  );
}
