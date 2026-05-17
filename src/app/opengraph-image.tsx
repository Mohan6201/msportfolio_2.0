import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Mohana Srinivasan | AWS DevOps Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px",
          background: "linear-gradient(135deg, #2c2523 0%, #1e1917 60%, #0d1a1c 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Cyan glow accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(21,209,233,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 6,
              height: 48,
              background: "#15d1e9",
              borderRadius: 3,
            }}
          />
          <span style={{ color: "#15d1e9", fontSize: 18, letterSpacing: "0.1em" }}>
            PORTFOLIO
          </span>
        </div>

        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#f1e1d9",
            margin: "0 0 12px",
            lineHeight: 1.1,
          }}
        >
          Mohana Srinivasan
        </h1>

        <p
          style={{
            fontSize: 28,
            color: "#88e5f0",
            margin: "0 0 32px",
          }}
        >
          AWS DevOps Engineer
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"].map((tag) => (
            <span
              key={tag}
              style={{
                padding: "6px 16px",
                background: "rgba(21,209,233,0.1)",
                border: "1px solid rgba(21,209,233,0.3)",
                borderRadius: 20,
                color: "#15d1e9",
                fontSize: 16,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
