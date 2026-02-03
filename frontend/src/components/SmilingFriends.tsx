import './SmilingFriends.css';

export default function SmilingFriends() {
  return (
    <div className="smiling-friends">
      <svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        {/* Left person */}
        <circle cx="40" cy="35" r="18" fill="#3b82f6" />
        <ellipse cx="40" cy="70" rx="22" ry="30" fill="#3b82f6" />
        <circle cx="35" cy="32" r="3" fill="#1e293b" />
        <circle cx="45" cy="32" r="3" fill="#1e293b" />
        <path d="M 32 40 Q 40 45 48 40" stroke="#1e293b" strokeWidth="2" fill="none" />
        
        {/* Right person */}
        <circle cx="160" cy="35" r="18" fill="#10b981" />
        <ellipse cx="160" cy="70" rx="22" ry="30" fill="#10b981" />
        <circle cx="155" cy="32" r="3" fill="#1e293b" />
        <circle cx="165" cy="32" r="3" fill="#1e293b" />
        <path d="M 152 40 Q 160 45 168 40" stroke="#1e293b" strokeWidth="2" fill="none" />
        
        {/* Handshake in center */}
        <rect x="55" y="55" width="20" height="12" rx="3" fill="#3b82f6" />
        <rect x="125" y="55" width="20" height="12" rx="3" fill="#10b981" />
        <rect x="75" y="53" width="50" height="16" rx="4" fill="#fbbf24" opacity="0.9" />
        
        {/* Celebration icons */}
        <text x="100" y="25" fontSize="20" textAnchor="middle">🎉</text>
        <text x="25" y="100" fontSize="16">💰</text>
        <text x="175" y="100" fontSize="16">✨</text>
      </svg>
      <p className="friendship-text">Split fair, stay friends!</p>
    </div>
  );
}
