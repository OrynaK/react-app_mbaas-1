import React, { useState, useEffect } from 'react';
import Backendless from 'backendless';
import './EditProfile.css';

const EditProfile = () => {
    const [user, setUser] = useState({
        email: '',
        name: '',
        age: '',
        gender: '',
        country: '',
        newPassword: '',
        confirmPassword: '',
        avatarUrl: '', // Додайте поле для URL аватарки
        trackLocation: false, // Додайте поле для відстеження місця розташування
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const currentUser = Backendless.UserService.currentUser;
            setUser({
                email: currentUser.email,
                name: currentUser.name,
                age: currentUser.age,
                gender: currentUser.gender,
                country: currentUser.country,
                avatarUrl: currentUser.avatarUrl, // Отримайте URL аватарки
                trackLocation: currentUser.trackLocation || false, // Отримайте дані про відстеження місця розташування
            });
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUser(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const currentUser = Backendless.UserService.currentUser;
            const updatedUser = { ...currentUser, ...user };
            await Backendless.UserService.update(updatedUser);
            alert('Профіль користувача успішно оновлено');
        } catch (error) {
            console.error('Failed to update user profile:', error);
            alert('Помилка при оновленні профілю користувача');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (user.newPassword !== user.confirmPassword) {
            alert('Паролі не співпадають');
            return;
        }

        try {
            await Backendless.UserService.update({ password: user.newPassword });
            alert('Пароль користувача успішно змінено');
        } catch (error) {
            console.error('Failed to change password:', error);
            alert('Помилка при зміні паролю');
        }
    };

    return (
        <div className="container">
            <h2>Профіль користувача</h2>
            {user.avatarUrl && <img src={user.avatarUrl} alt="Avatar" className="avatar" />}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Новий пароль:</label>
                    <input type="password" name="newPassword" value={user.newPassword} onChange={handleChange}/>
                </div>
                <div>
                    <label>Підтвердіть новий пароль:</label>
                    <input type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange}/>
                </div>
                <button onClick={handlePasswordChange}>Змінити пароль</button>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={user.email} onChange={handleChange}/>
                </div>
                <div>
                    <label>Ім'я:</label>
                    <input type="text" name="name" value={user.name} onChange={handleChange}/>
                </div>
                <div>
                    <label>Вік:</label>
                    <input type="number" name="age" value={user.age} onChange={handleChange}/>
                </div>
                <div>
                    <label>Стать:</label>
                    <select name="gender" value={user.gender} onChange={handleChange}>
                        <option value="male">Чоловіча</option>
                        <option value="female">Жіноча</option>
                        <option value="other">Інше</option>
                    </select>
                </div>
                <div>
                    <label>Країна:</label>
                    <input type="text" name="country" value={
                        user.country} onChange={handleChange}/>
                </div>
                {/* Додати чекбокс для відстеження місця розташування */}
                <div>
                    <input type="checkbox" name="trackLocation" checked={user.trackLocation} onChange={handleChange}/>
                    <label>Відслідковувати моє місце розташування</label>
                </div>
                <button type="submit">Зберегти зміни</button>
            </form>
        </div>
    );
};

export default EditProfile;