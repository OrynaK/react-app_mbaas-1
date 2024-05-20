import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Backendless from 'backendless';
import './ProfilePage.css';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [filesList, setFilesList] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (user) {
            fetchFilesList();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser();
            setUser(currentUser);
            setAvatarUrl(currentUser.avatarUrl);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchFilesList = async () => {
        try {
            const fileList = await Backendless.Files.listing(`/user_files/${user.name}`);
            const imageFiles = fileList.filter(file =>
                file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')
            );
            setFilesList(imageFiles);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
    };

    const handleFileSelect = (fileUrl) => {
        setSelectedFile(fileUrl);
    };

    const handleSaveAvatar = async () => {
        if (!selectedFile) {
            setError('Будь ласка, виберіть файл для аватара');
            return;
        }
        try {
            user.avatarUrl = selectedFile;
            await Backendless.UserService.update(user);
            setAvatarUrl(selectedFile);
            setError('');
        } catch (error) {
            console.error('Failed to save avatar:', error);
            setError('Помилка під час збереження аватара');
        }
    };

    return (
        <div className="container">
            <h2>Профіль користувача</h2>
            {user ? (
                <div className="userInfo">
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div className="avatarContainer">
                        <img src={avatarUrl} alt="Аватар" className="avatar" />
                        <div>
                            <h3>Виберіть файл для аватара:</h3>
                            <ul className="fileList">
                                {filesList.map((file) => (
                                    <li key={file.publicUrl} className="fileItem">
                                        <span>{file.name}</span>
                                        <button className="button" onClick={() => handleFileSelect(file.publicUrl)}>Вибрати</button>
                                    </li>
                                ))}
                            </ul>
                            {selectedFile && (
                                <div className="selectedFilePreview">
                                    <h3>Обраний файл:</h3>
                                    <img src={selectedFile} alt="Обраний аватар" className="selectedFileImage" />
                                    <button className="button" onClick={handleSaveAvatar}>Зберегти аватар</button>
                                </div>
                            )}
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                        </div>
                    </div>
                    <div>
                        <h3>Поточні дані користувача:</h3>
                        <p><strong>Ім'я:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                    </div>
                    <Link to="/editProfile" className="button">Редагувати профіль</Link>
                    <Link to="/fileManager" className="button">Робота з файлами</Link>
                </div>
            ) : (
                <p>Дані профілю завантажуються...</p>
            )}
        </div>
    );



};

export default ProfilePage;