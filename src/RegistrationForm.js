import React, { useState } from 'react';
import Backendless from 'backendless';
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css'; // Імпорт CSS файлу

function RegistrationForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        gender: '',
        country: '',
        error: '',
        passwordError: '',
        ageError: '',
        emailError: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password, name, age, gender, country } = formData;
        let hasError = false;

        setFormData({
            ...formData,
            error: '',
            passwordError: '',
            ageError: '',
            emailError: ''
        });

        try {
            if (password.length < 6) {
                setFormData(prevState => ({ ...prevState, passwordError: 'Пароль повинен містити принаймні 6 символів' }));
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
                country
            };

            const work_dir = `/user_files/${user.name}`;
            await Backendless.Files.createDirectory(work_dir);
            const shared_dir = `/user_files/${user.name}/shared_with_me`;
            await Backendless.Files.createDirectory(shared_dir);
            const registeredUser = await Backendless.UserService.register(user);

            console.log('Successfully registered user:', registeredUser);
            navigate("/fileManager");
            setFormData({
                email: '',
                password: '',
                name: '',
                age: '',
                gender: '',
                country: '',
                error: '',
                passwordError: '',
                ageError: '',
                emailError: ''
            });
        } catch (error) {
            console.error('Error registering user:', error);
            setFormData(prevState => ({ ...prevState, error: 'Помилка при реєстрації користувача' }));
        }
    };


    const { email, password, name, age, gender, country, error } = formData;

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
                <button type="submit">Зареєструватися</button>
            </form>
        </div>
    );

}

export default RegistrationForm;
