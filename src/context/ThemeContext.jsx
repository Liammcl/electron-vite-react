import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleTheme = (event) => {
    const { clientX, clientY } = event;
    let outIsDark;

    const toggleTheme = () => {
      setIsDarkMode((prev) => {
        const newPrev = !prev;
        outIsDark = newPrev;
        return newPrev;
      });
    };

    if ("startViewTransition" in document) {
      const transition = document.startViewTransition(() => {
        toggleTheme();
      });

      transition.ready.then(() => {
        const radius = Math.hypot(
          Math.max(clientX, innerWidth - clientX),
          Math.max(clientY, innerHeight - clientY)
        );

        const clipPath = [
          `circle(0px at ${clientX}px ${clientY}px)`,
          `circle(${radius}px at ${clientX}px ${clientY}px)`,
        ];

        document.documentElement.animate(
          { clipPath: outIsDark ? clipPath.reverse() : clipPath },
          {
            duration: 300,
            easing: "ease-in",
            pseudoElement: outIsDark
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
          }
        );
      });
    } else {
      toggleTheme();
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme: handleTheme }}>
      <ConfigProvider
        componentSize="small"
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            // 主色调 - Google Blue
            colorPrimary: "#1a73e8",
            colorPrimaryHover: "#1557b0",
            colorPrimaryActive: "#174ea6",

            // 成功色 - Google Green
            colorSuccess: "#1e8e3e",
            colorSuccessHover: "#188130",
            colorSuccessActive: "#137333",

            // 警告色 - Google Yellow
            colorWarning: "#f9ab00",
            colorWarningHover: "#f29900",
            colorWarningActive: "#ea8600",

            // 错误色 - Google Red
            colorError: "#d93025",
            colorErrorHover: "#c5221f",
            colorErrorActive: "#a50e0e",

            // 文字颜色
            colorText: isDarkMode
              ? "rgba(255, 255, 255, 0.87)"
              : "rgba(0, 0, 0, 0.87)",
            colorTextSecondary: isDarkMode
              ? "rgba(255, 255, 255, 0.60)"
              : "rgba(0, 0, 0, 0.60)",
            colorTextTertiary: isDarkMode
              ? "rgba(255, 255, 255, 0.38)"
              : "rgba(0, 0, 0, 0.38)",

            // 背景色
            colorBgContainer: isDarkMode ? "#1f1f1f" : "#ffffff",
            colorBgElevated: isDarkMode ? "#2d2d2d" : "#ffffff",
            colorBgLayout: isDarkMode ? "#121212" : "#f8f9fa",

            // 边框
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 4,
            colorBorder: isDarkMode
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(0, 0, 0, 0.12)",

            // 阴影
            boxShadow:
              "0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)",
            boxShadowSecondary:
              "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",

            // 字体
            fontFamily: "Google Sans, Roboto, Arial, sans-serif",
            fontSize: 14,

            // 控件尺寸
            controlHeight: 36,
            controlHeightSM: 32,
            controlHeightLG: 44,
          },
          components: {
            Button: {
              algorithm: true,
              borderRadius: 20, // Google 风格的圆角按钮
              controlHeight: 36,
              controlHeightSM: 32,
              controlHeightLG: 44,
              paddingContentHorizontal: 24,
            },
            Input: {
              algorithm: true,
              controlHeight: 36,
              controlHeightSM: 32,
              controlHeightLG: 44,
              paddingContentHorizontal: 16,
              borderRadius: 4,
              controlOutline: "none",
              controlOutlineWidth: 0,
              controlPaddingHorizontal: 16,
              controlPaddingHorizontalSM: 12,
              addonBg: "transparent",
            },
            Select: {
              algorithm: true,
              controlHeight: 36,
              controlHeightSM: 32,
              controlHeightLG: 44,
              borderRadius: 4,
              controlOutline: "none",
              controlOutlineWidth: 0,
              selectorBg: "transparent",
            },
            Card: {
              algorithm: true,
              borderRadiusLG: 8,
              boxShadow:
                "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
            },
            Menu: {
              algorithm: true,
              itemBorderRadius: 20, // Google 风格的圆角菜单项
              itemHeight: 36,
              itemHeightSM: 32,
            },
            Tabs: {
              algorithm: true,
              inkBarColor: "#1a73e8",
              itemSelectedColor: "#1a73e8",
              itemHoverColor: "#174ea6",
            },
            Table: {
              algorithm: true,
              borderRadius: 8,
              headerBg: isDarkMode ? "#2d2d2d" : "#f8f9fa",
            },
            Modal: {
              algorithm: true,
              borderRadius: 28, // Google 风格的大圆角对话框
              paddingContentHorizontal: 24,
              paddingContentVertical: 24,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
