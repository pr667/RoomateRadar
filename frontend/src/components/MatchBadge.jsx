// src/components/MatchBadge.jsx
import { scoreBg } from '../utils/formatters';

export default function MatchBadge({ score }) {
  if (score == null) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${scoreBg(score)}`}
    >
      {score}% Match
    </span>
  );
}
