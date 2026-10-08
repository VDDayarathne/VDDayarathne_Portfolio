import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";


export const dynamic = "force-static";
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
          background: "#f6f7f5",
          color: "#182b30",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#245e66", letterSpacing: 3 }}>
          SOFTWARE ENGINEER · SRI LANKA
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 600,
            marginTop: 24,
            letterSpacing: -3,
          }}
        >
          {profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 30, lineHeight: 1.5, marginTop: 24, color: "#43565c", maxWidth: 950 }}>
          {profile.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
