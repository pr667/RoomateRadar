import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition-all duration-300 hover:scale-110"
      style={{
        backgroundColor: dark ? '#ffffff' : '#1a1a1a',
        color: dark ? '#1a1a1a' : '#ffffff',
      }}
      aria-label="Toggle theme"
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
