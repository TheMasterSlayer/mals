import { createTheme, type PaletteMode } from '@mui/material/styles';

// ── MALS Command-Center Color Palette ────────────────────────────────────────
const darkNavy   = '#0A1628';
const navy       = '#0D2137';
const steel      = '#1A3A5C';
const tacticalBlue = '#1E4D8C';
const accent     = '#00B4D8';
const accentHover = '#0096B4';
const success    = '#22C55E';
const warning    = '#F59E0B';
const danger     = '#EF4444';
const textPrimary = '#E2E8F0';
const textSecondary = '#94A3B8';

export function buildTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: accent,
        dark: accentHover,
        contrastText: '#000',
      },
      secondary: {
        main: tacticalBlue,
        contrastText: '#fff',
      },
      background: {
        default: isDark ? darkNavy  : '#F1F5F9',
        paper:   isDark ? navy      : '#FFFFFF',
      },
      text: {
        primary:   isDark ? textPrimary   : '#0F172A',
        secondary: isDark ? textSecondary : '#475569',
      },
      error:   { main: danger },
      warning: { main: warning },
      success: { main: success },
      divider: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(0,0,0,0.08)',
    },

    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
      h4: { fontWeight: 700, letterSpacing: '0.02em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      overline: { letterSpacing: '0.15em', fontWeight: 600 },
    },

    shape: { borderRadius: 8 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? `${steel} ${darkNavy}` : '#CBD5E1 #F1F5F9',
          },
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: isDark ? navy : '#1E3A5F',
            borderBottom: `1px solid ${isDark ? steel : 'transparent'}`,
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? darkNavy : '#1A2E4A',
            color: textPrimary,
          },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? steel : '#E2E8F0'}`,
            backgroundImage: 'none',
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
          containedPrimary: { color: '#000' },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 6 },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              backgroundColor: isDark ? steel : '#1E3A5F',
              color: isDark ? textSecondary : '#CBD5E1',
            },
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(0,180,216,0.06)' : 'rgba(30,77,140,0.04)',
            },
          },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& fieldset': {
              borderColor: isDark ? steel : '#CBD5E1',
            },
          },
        },
      },
    },
  });
}

export const darkTheme  = buildTheme('dark');
export const lightTheme = buildTheme('light');
