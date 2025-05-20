
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "./MessageForm.css";

const MessageForm = () => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  
  const fetchUserData = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/v1/auth/me", { withCredentials: true });
      if (data.user) {
        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setEmail(data.user.email);
        setPhone(data.user.phone || "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleMessage = async (e) => {
    e.preventDefault();
    try {
      const fullName = `${firstName} ${lastName}`;
      await axios.post("http://localhost:4000/api/v1/message/send", { fullName, email, phone, message }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }).then((res) => {
        toast.success(res.data.message);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setMessage("");
      });
    } catch (error) {
      toast.error(error.response.data.message || t("Error occurred"));
    }
  };

  return (
    <div className="container form-component message-form">
      <h2>{t("Send Us A Message")}</h2>
      <form onSubmit={handleMessage}>
        <div>
          <input type="text" placeholder={t("First Name")} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input type="text" placeholder={t("Last Name")} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <input type="text" placeholder={t("Email")} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="number" placeholder={t("Mobile Number")} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <textarea rows={7} placeholder={t("Message")} value={message} onChange={(e) => setMessage(e.target.value)} />
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <button type="submit">{t("Send")}</button>
        </div>
      </form>
      <img src="/Vector.png" alt="vector" />
    </div>
  );
};

export default MessageForm;
