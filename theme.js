export const COLORS = {
  primary: '#3B82F6', // Blue-500
  background: '#F1F5F9', // Slate-100
  card: '#FFFFFF',
  text: '#1E293B', // Slate-800
  textSecondary: '#64748B', // Slate-500
  success: '#16A34A', // Green-600
  danger: '#DC2626', // Red-600
  lightGray: '#E2E8F0', // Slate-200
  online: '#16A34A', // Green-600
  offline: '#64748B', // Slate-500
  border: '#CBD5E1', // Slate-300
};

export const SIZES = {
  base: 8,
  font: 14,
  h1: 32,
  h2: 24,
  h3: 18,
  body: 14,
  padding: 20,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: SIZES.h3, fontWeight: '600', color: COLORS.text },
  body: { fontSize: SIZES.body, color: COLORS.textSecondary },
};