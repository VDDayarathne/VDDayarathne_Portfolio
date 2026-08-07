import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "radial-gradient(circle at 20% 20%, #171225 0%, #05050a 60%)",
          color: "#f3f2fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#22d3ee", letterSpacing: 4 }}>
          SOFTWARE ENGINEER · SRI LANKA
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            marginTop: 24,
            background: "linear-gradient(120deg, #ffffff 20%, #22d3ee 55%, #8b5cf6 85%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 24, color: "#8f8ca3", maxWidth: 900 }}>
          {profile.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
