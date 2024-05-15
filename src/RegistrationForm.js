import React, {useState} from 'react';
import Backendless from 'backendless';
import {useNavigate} from "react-router-dom";


function RegistrationForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        gender: '',
        country: '',
        error: ''
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

        const {email, password, name, age, gender, country} = formData;

        try {
            if (password.length < 6) {
                throw new Error('Пароль повинен містити принаймні 6 символів');
            }

            const parsedAge = parseInt(age);
            if (isNaN(parsedAge) || parsedAge < 5) {
                throw new Error('Ви повинні бути старше 5 років для реєстрації');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Введіть коректну адресу електронної пошти');
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
            await Backendless.Files.createDirectory(work_dir)
            const shared_dir = `/user_files/${user.name}/shared_with_me`;
            await Backendless.Files.createDirectory(shared_dir)
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
                error: ''
            });
        } catch (error) {
            console.error('Error registering user:', error);
            setFormData({...formData, error: 'Помилка при реєстрації користувача'});
        }
    };

    const {email, password, name, age, gender, country, error} = formData;

    return (
        <div>
            <h2>Реєстрація нового користувача</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={email} onChange={handleChange} required/>
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" value={password} onChange={handleChange} required/>
                </div>
                <div>
                    <label>Ім'я:</label>
                    <input type="text" name="name" value={name} onChange={handleChange} required/>
                </div>
                <div>
                    <label>Вік:</label>
                    <input type="number" name="age" value={age} onChange={handleChange} required/>
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
                    <input type="text" name="country" value={country} onChange={handleChange} required/>
                </div>
                <button type="submit">Зареєструватися</button>
            </form>
        </div>
    );
}

export default RegistrationForm;