import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme as nwColorScheme } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  surfaceMuted: string;
  cardAlt: string;
  chip: string;
  border: string;
  borderMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  muted: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  inputBackground: string;
  inputBorder: string;
  tabBarBackground: string;
  tabBarBorder: string;
  cardShadow: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  star: string;
}

export const lightColors: ThemeColors = {
  background: "#FAF7F3",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfacePressed: "#F5ECE6",
  surfaceMuted: "#F5EFE9",
  cardAlt: "#FAF8F5",
  chip: "#FAF3EE",
  border: "#EEE5DE",
  borderMuted: "#F2ECE7",
  text: "#241C18",
  textSecondary: "#776B64",
  textMuted: "#A3978E",
  muted: "#8A7D75",
  textInverse: "#FFFFFF",
  primary: "#B95E2E",
  primaryDark: "#9E4D24",
  primaryLight: "#D87943",
  primarySoft: "#FAF3EE",
  inputBackground: "#FFFFFF",
  inputBorder: "#E8DFD7",
  tabBarBackground: "#FFFFFF",
  tabBarBorder: "#EEE5DE",
  cardShadow: "#000000",
  danger: "#E0524D",
  dangerSoft: "#FFF0F0",
  success: "#2E7D32",
  successSoft: "#EAF5EA",
  star: "#E89B2B",
};

export const darkColors: ThemeColors = {
  background: "#120E0C",
  surface: "#1C1613",
  surfaceElevated: "#241C18",
  surfacePressed: "#2A211D",
  surfaceMuted: "#271E19",
  cardAlt: "#241C18",
  chip: "#2A1D16",
  border: "#332720",
  borderMuted: "#281E19",
  text: "#F5EFEB",
  textSecondary: "#D8CFC8",
  textMuted: "#B2A69E",
  muted: "#B2A69E",
  textInverse: "#120E0C",
  primary: "#E07A43",
  primaryDark: "#F08F59",
  primaryLight: "#E89260",
  primarySoft: "#2A1D16",
  inputBackground: "#1F1814",
  inputBorder: "#382C24",
  tabBarBackground: "#1A1411",
  tabBarBorder: "#2E231C",
  cardShadow: "#000000",
  danger: "#EB635E",
  dangerSoft: "#331615",
  success: "#4CAF50",
  successSoft: "#132E16",
  star: "#F2AA38",
};

const THEME_STORAGE_KEY = "@caffora_theme_preference";

type ThemeContextType = {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "system",
  isDark: false,
  colors: lightColors,
  setThemeMode: async () => {},
  toggleTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && saved && (saved === "light" || saved === "dark" || saved === "system")) {
          setThemeModeState(saved as ThemeMode);
          nwColorScheme.set(saved as ThemeMode);
        }
      } catch (err) {
        console.error("Failed to load saved theme:", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return systemScheme === "dark";
    }
    return themeMode === "dark";
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      setThemeModeState(mode);
      nwColorScheme.set(mode);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch (err) {
        console.error("Failed to save theme mode:", err);
      }
    },
    [],
  );

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = isDark ? "light" : "dark";
    await setThemeMode(nextMode);
  }, [isDark, setThemeMode]);

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      themeMode,
      isDark,
      colors,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, isDark, colors, setThemeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
