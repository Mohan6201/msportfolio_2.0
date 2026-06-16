"use client";
import { useState } from "react";

const domainMap: Record<string, string> = {
  "Guvi": "guvi.in",
  "3Edge Solutions Pvt Ltd": "3edge.in",
  "Korber Supply Chain": "koerber-supplychain.com",
  "RedSys9 Tech Pvt Ltd": "red9systech.com",
};

const getBackgroundColor = (issuer: string) => {
  if (!issuer) return "#ccc";
  let hash = 0;
  for (let i = 0; i < issuer.length; i++) {
    hash = issuer.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 80%)`;
};

interface CertificateLogoProps {
  issuer: string;
}

const CertificateLogo = ({ issuer }: CertificateLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const domain = domainMap[issuer];
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;
  const fallbackLetter = issuer?.charAt(0).toUpperCase() ?? "?";
  const backgroundColor = getBackgroundColor(issuer);

  return (
    <div
      className="w-8 h-8 mr-2 flex items-center justify-center rounded-full overflow-hidden shadow-sm"
      style={{ backgroundColor }}
    >
      {!imageError && logoUrl ? (
        <img
          src={logoUrl}
          alt={`${issuer} logo`}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-sm font-semibold text-gray-800">{fallbackLetter}</span>
      )}
    </div>
  );
};

export default CertificateLogo;
