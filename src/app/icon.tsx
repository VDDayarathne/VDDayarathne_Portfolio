import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          background: "linear-gradient(135deg, #05050a 0%, #171225 100%)",
          border: "2px solid rgba(139,92,246,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            fontFamily: "sans-serif",
            background: "linear-gradient(120deg, #ffffff 20%, #22d3ee 60%, #8b5cf6 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          VD
        </div>
      </div>
    ),
    { ...size }
  );
}
