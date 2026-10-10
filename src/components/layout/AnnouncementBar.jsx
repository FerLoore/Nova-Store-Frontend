export function AnnouncementBar() {
  return (
    <div
      style={{
        background: "#1a1919",
        color: "#d3d3d3",
        fontSize: 11,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        padding: "6px 16px",
        textAlign: "center",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          background: "#e4f222",
          borderRadius: 2,
          display: "inline-block",
        }}
      />
      <span>NOVA STORE — PANEL ADMINISTRATIVO</span>
    </div>
  );
}
