import React, { useState } from "react";
import Backendless from "backendless";
import { useNavigate, Link } from "react-router-dom";
import ForgotPassword from "./ForgotPasswordForm";
import "./LoginForm.css"; // Підключаємо файл стилів

const LoginForm = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "name") {
            setName(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = await Backendless.UserService.login(name, password, true);
            console.log("Успішна авторизація:", user);

            setName("");
            setPassword("");
            setError("");
            navigate("/fileManager");

        } catch (error) {
            console.error("Помилка авторизації:", error.message);
            setError(error.message);
        }
    };

    const handleResetPassword = () => {
        setShowForgotPasswordForm(true);
    };

    return (
        <div className="login-form-container">
            <h2 className="login-form-title">Авторизація</h2>
            {error && <p className="login-error">{error}</p>}
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Ім'я:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <button type="submit" className="login-button">Увійти</button>
                    <button type="button" onClick={handleResetPassword} className="forgot-password-button">Скинути пароль</button>
                    <Link to="/" className="back-to-home-link">На головну</Link>
                </div>
            </form>
            {showForgotPasswordForm && <ForgotPassword />}
        </div>
    );
};

export default LoginForm;