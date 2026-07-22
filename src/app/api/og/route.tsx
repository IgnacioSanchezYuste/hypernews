import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";

/** Dynamic 1200×630 OpenGraph image generator. */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? site.name).slice(0, 120);
  const subtitle = searchParams.get("subtitle") ?? site.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0f2b3a 0%, #106d99 60%, #22a9de 130%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", width: 56, height: 56, borderRadius: 16, background: "#22a9de", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800 }}>HF</div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            <span>Hyper</span>
            <span style={{ color: "#7bd0f6" }}>News</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, color: "#7bd0f6", marginBottom: 20, textTransform: "uppercase", letterSpacing: 3 }}>{subtitle}</div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
        </div>

        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.6)" }}>{site.url.replace("https://", "")}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
