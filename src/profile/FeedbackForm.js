import React, { useState } from "react";
import Backendless from "backendless";
import "./FeedbackForm.css";

const FeedbackForm = () => {
    const [message, setMessage] = useState("");
    const [type, setType] = useState("помилка");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChangeMessage = (e) => {
        setMessage(e.target.value);
    };

    const handleChangeType = (e) => {
        setType(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message) {
            setError("Введіть повідомлення.");
            return;
        }

        const feedback = {
            message,
            type,
        };

        try {
            await Backendless.Data.of("Feedback").save(feedback);

            const emailContent = {
                subject: `Feedback: ${type}`,
                bodyParts: { textmessage: message },
                to: ["oryna.kasapova@gmail.com"],
            };

            await Backendless.Messaging.sendEmail(emailContent.subject, emailContent.bodyParts, emailContent.to);

            setSuccess(true);
            setMessage("");
            setType("помилка");
            setError("");
        } catch (error) {
            console.error("Помилка відправки повідомлення:", error.message);
            setError("Не вдалося відправити повідомлення. Спробуйте пізніше.");
        }
    };

    return (
        <div className="feedback-form-container">
            <h2 className="feedback-form-title">Розробнику (Feedback)</h2>
            {error && <p className="feedback-error">{error}</p>}
            {success && <p className="feedback-success">Повідомлення успішно відправлено!</p>}
            <form className="feedback-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="type">Тип повідомлення:</label>
                    <select id="type" name="type" value={type} onChange={handleChangeType} className="form-input">
                        <option value="помилка">Помилка</option>
                        <option value="порада">Порада</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="message">Повідомлення:</label>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={handleChangeMessage}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <button type="submit" className="feedback-button">Відправити</button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;
