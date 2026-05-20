export const colors = {
  bg: "#0a0815",
  surface: "rgba(255,255,255,0.05)",
  surfaceLight: "rgba(255,255,255,0.08)",
  gold: "#d4a853",
  goldLight: "#e8c065",
  goldDark: "#b8923e",
  white: "#ffffff",
  text: "#ffffff",
  textSecondary: "rgba(255,255,255,0.6)",
  textMuted: "rgba(255,255,255,0.35)",
  border: "rgba(212,168,83,0.15)",
  success: "#10B981",
  error: "#EF4444",
  overlay: "rgba(0,0,0,0.6)",
};

export const shadows = {
  card: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const glass = {
  backgroundColor: colors.surface,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.border,
};

export const gradient = `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`;
