import React, { useState } from 'react';
import Backendless from 'backendless';
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css'; // Імпорт CSS файлу

function RegistrationForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        age: '',
        gender: '',
        country: '',
        locationTrackingEnabled: false,
        error: '',
        passwordError: '',
        confirmPasswordError: '',
        ageError: '',
        emailError: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password, confirmPassword, name, age, gender, country, locationTrackingEnabled } = formData;
        let hasError = false;

        setFormData({
            ...formData,
            error: '',
            passwordError: '',
            confirmPasswordError: '',
            ageError: '',
            emailError: ''
        });

        try {
            if (password.length < 6) {
                setFormData(prevState => ({ ...prevState, passwordError: 'Пароль повинен містити принаймні 6 символів' }));
                hasError = true;
            }

            if (password !== confirmPassword) {
                setFormData(prevState => ({ ...prevState, confirmPasswordError: 'Паролі не співпадають' }));
                hasError = true;
            }

            const parsedAge = parseInt(age);
            if (isNaN(parsedAge) || parsedAge < 5) {
                setFormData(prevState => ({ ...prevState, ageError: 'Ви повинні бути старше 5 років для реєстрації' }));
                hasError = true;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setFormData(prevState => ({ ...prevState, emailError: 'Введіть коректну адресу електронної пошти' }));
                hasError = true;
            }

            if (hasError) {
                return;
            }

            const user = {
                email,
                password,
                name,
                age: parsedAge,
                gender,
                country,
                locationTrackingEnabled
            };

            const work_dir = `/user_files/${user.name}`;
            await Backendless.Files.createDirectory(work_dir);
            const shared_dir = `/user_files/${user.name}/shared_with_me`;
            await Backendless.Files.createDirectory(shared_dir);
            const registeredUser = await Backendless.UserService.register(user);

            console.log('Successfully registered user:', registeredUser);
            navigate("/login");
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                name: '',
                age: '',
                gender: '',
                country: '',
                locationTrackingEnabled: false,
                error: '',
                passwordError: '',
                confirmPasswordError: '',
                ageError: '',
                emailError: ''
            });
        } catch (error) {
            console.error('Error registering user:', error);
            if (error.code === 3033) { // Error code for existing user
                setFormData(prevState => ({ ...prevState, emailError: 'Користувач з такою електронною поштою вже існує' }));
            } else {
                setFormData(prevState => ({ ...prevState, error: 'Помилка при реєстрації користувача' }));
            }
        }
    };

    const { email, password, confirmPassword, name, age, gender, country, locationTrackingEnabled, error } = formData;

    return (
        <div className="registration-form">
            <h2>Реєстрація нового користувача</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={email} onChange={handleChange} required />
                    {formData.emailError && <p className="error">{formData.emailError}</p>}
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" value={password} onChange={handleChange} required />
                    {formData.passwordError && <p className="error">{formData.passwordError}</p>}
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleChange} required />
                    {formData.confirmPasswordError && <p className="error">{formData.confirmPasswordError}</p>}
                </div>
                <div>
                    <label>Ім'я:</label>
                    <input type="text" name="name" value={name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Вік:</label>
                    <input type="number" name="age" value={age} onChange={handleChange} required />
                    {formData.ageError && <p className="error">{formData.ageError}</p>}
                </div>
                <div>
                    <label>Стать:</label>
                    <select name="gender" value={gender} onChange={handleChange} required>
                        <option value="">Виберіть стать</option>
                        <option value="male">Чоловіча</option>
                        <option value="female">Жіноча</option>
                        <option value="other">Інше</option>
                    </select>
                </div>
                <div>
                    <label>Країна:</label>
                    <input type="text" name="country" value={country} onChange={handleChange} required />
                </div>
                <div>
                    <label>Location Tracking Enabled:</label>
                    <input type="checkbox" name="locationTrackingEnabled" checked={locationTrackingEnabled} onChange={handleChange} />
                </div>
                <button type="submit">Зареєструватися</button>
            </form>
        </div>
    );
}

export default RegistrationForm;
