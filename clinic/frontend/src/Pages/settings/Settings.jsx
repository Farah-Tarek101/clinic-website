import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Settings.css";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedFontSize = localStorage.getItem("fontSize") || "medium";
    const savedLanguage = localStorage.getItem("language") || "en";

    setDarkMode(savedDarkMode);
    setFontSize(savedFontSize);
    setLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
    applyTheme(savedDarkMode);
    applyFontSize(savedFontSize);
  }, [i18n]);

  const applyTheme = (dark) => {
    document.body.classList.toggle("dark-mode", dark);
  };

  const applyFontSize = (size) => {
    document.documentElement.style.fontSize =
      size === "small" ? "14px" : size === "large" ? "18px" : "16px";
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    applyTheme(newDarkMode);
  };

  const handleFontSizeChange = (event) => {
    const newSize = event.target.value;
    setFontSize(newSize);
    localStorage.setItem("fontSize", newSize);
    applyFontSize(newSize);
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="settings-container">
      <h2>{t("settings")}</h2>

      <div className="setting-option">
        <label>{t("darkMode")}</label>
        <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
      </div>

      <div className="setting-option">
        <label>{t("fontSize")}</label>
        <select value={fontSize} onChange={handleFontSizeChange}>
          <option value="small">{t("small")}</option>
          <option value="medium">{t("medium")}</option>
          <option value="large">{t("large")}</option>
        </select>
      </div>

      <div className="setting-option">
        <label>{t("language")}</label>
        <select value={language} onChange={handleLanguageChange}>
          <option value="en">{t("english")}</option>
          <option value="ar">{t("arabic")}</option>
          <option value="fr">{t("french")}</option>
        </select>
      </div>
    </div>
  );
};

export default Settings;
