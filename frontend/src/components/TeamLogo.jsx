import { getTeamLogoUrl } from '../data/teams';

export default function TeamLogo({ abbr, size = 40, className = '' }) {
  return (
    <img
      src={getTeamLogoUrl(abbr)}
      alt={abbr}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.35))' }}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}
