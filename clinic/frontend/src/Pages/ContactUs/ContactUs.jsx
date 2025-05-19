import React from "react";
import { useTranslation } from "react-i18next";
import MessageForm from "../../components/MessageForm/MessageForm";
import "./ContactUs.css";

const ContactUs = () => {
  const { t } = useTranslation(); // Hook for translations

  return (
    <div className="contact-us">
      <h1>{t("get")} {t("in")} {t("touch")}</h1>
      <p>{t("if")} {t("you")} {t("have")} {t("any")} {t("questions")} {t("or")} {t("need")} {t("assistance")}, 
        {t("please")} {t("reach")} {t("out")} {t("to")} {t("us")} {t("using")} {t("the")} {t("form")} {t("below")}.</p>
      <MessageForm />
    </div>
  );
};

export default ContactUs;
