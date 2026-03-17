import { getTeamLogoUrl } from '../data/teams';

export default function TeamLogo({ abbr, size = 40, className = '' }) {
  return (
    <img
      src={getTeamLogoUrl(abbr)}
      alt={abbr}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}
