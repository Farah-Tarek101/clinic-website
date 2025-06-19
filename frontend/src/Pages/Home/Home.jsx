import 'font-awesome/css/font-awesome.min.css';
import React from "react";
import { useTranslation } from "react-i18next";
import Departments from "../../components/Departments/Departments";
import MessageForm from "../../components/MessageForm/MessageForm";
import "./Home.css";

const Home = () => {
  const { t } = useTranslation(); // Hook for translations

  return (
    <>
      <div className="home">
        <div className="overlay"></div> {/* Overlay for opacity */}
        <h1>{t("welcome")} {t("to")} {t("motion")} {t("clinic")}</h1>
        <p>{t("excellence")} {t("in")} {t("orthopedics")} & {t("physical")} {t("therapy")}</p>
        <button className="call-now-btn">{t("call")} {t("now")}</button>
      </div>

      <div className="home-cards-container">
        <div className="home-card">
          <i className="fa fa-hospital-o card-logo"></i>
          <h3>{t("our")} {t("departments")}</h3>
          <p>
            {t("best")} {t("first")} {t("of")} {t("its")} {t("kind")} {t("medical")} {t("care")} {t("center")} {t("in")} {t("egypt")} 
            {t("offering")} {t("consultations")}, {t("personalized")} {t("treatment")}, {t("supervised")} {t("by")} {t("doctor")}.
          </p>
        </div>
        <div className="home-card">
          <i className="fa fa-stethoscope card-logo"></i>
          <h3>{t("specialized")} {t("services")}</h3>
          <p>
            {t("highly")} {t("specialized")} {t("doctors")} {t("operate")} {t("our")} {t("surgical")} {t("center")}, {t("clinic")}, 
            {t("and")} {t("physical")} {t("therapy")}.
          </p>
        </div>
        <div className="home-card">
          <i className="fa fa-comments card-logo"></i>
          <h3>{t("online")} {t("consultation")}</h3>
          <p>
            {t("online")} {t("consultations")} {t("are")} {t("available")} {t("through")} {t("ai")} {t("chat")} {t("service")}.
          </p>
        </div>
        <div className="home-card">
          <i className="fa fa-plus-circle card-logo"></i>
          <h3>{t("new")} {t("services")}</h3>
          <p>
            {t("Motion")} {t("clinics")} {t("is")} {t("more")} {t("than")} {t("just")} {t("a")} {t("medical")} {t("care")} {t("center")}. 
            {t("we")} {t("have")} {t("a")} {t("physical")} {t("therapy")} {t("department")} {t("for")} {t("you")}.
          </p>
        </div>
      </div>

      <div className="departments-container" id="departments-section">
        <Departments />
      </div>

      <MessageForm />
    </>
  );
};

export default Home;
