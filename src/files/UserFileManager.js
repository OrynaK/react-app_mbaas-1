import React, { useEffect, useState } from 'react';
import Backendless from 'backendless';
import { useNavigate } from "react-router";
import axios from 'axios';
import './UserFileManager.css';

const FileManager = () => {
    const [filesList, setFilesList] = useState([]);
    const [directoriesList, setDirectoriesList] = useState([]);
    const [currentDirectory, setCurrentDirectory] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [fileToShare, setFileToShare] = useState('');
    const user = Backendless.UserService.currentUser;
    const navigate = useNavigate();

    useEffect(() => {
        fetchFilesList(currentDirectory);
    }, [currentDirectory]);

    const handleCreateFolder = async () => {
        try {
            const directoryPath = `/user_files/${user.name}/${currentDirectory}/${newFolderName}`;
            await Backendless.Files.createDirectory(directoryPath);
            fetchFilesList(currentDirectory);
            setNewFolderName(''); // Очистити поле вводу після створення папки
        } catch (error) {
            console.error('Failed to create folder:', error);
        }
    };

    const fetchFilesList = async (dir) => {
        try {
            const fileList = await Backendless.Files.listing('/user_files/' + user.name + '/' + dir);
            const files = fileList.filter(file => file.name.indexOf('.') !== -1);
            const directories = fileList.filter(file => file.name.indexOf('.') === -1);
            setFilesList(files);
            setDirectoriesList(directories);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
    };

    const handleDelete = async (fileName) => {
        try {
            await Backendless.Files.remove(`/user_files/${user.name}/${currentDirectory}/${fileName}`);
            await fetchFilesList(currentDirectory);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    const handleUploadFile = async (event) => {
        try {
            const file = event.target.files[0];
            await Backendless.Files.upload(file, `/user_files/${user.name}/${currentDirectory}`);
            fetchFilesList(currentDirectory);
        } catch (error) {
            console.error('Failed to upload file:', error);
        }
    };

    const handleShareFile = async () => {
        try {
            if (!recipientName) {
                alert('Будь ласка, вкажіть ім\'я користувача');
                return;
            }
            const userExists = await Backendless.Data.of("Users")
                .find(Backendless.DataQueryBuilder.create().setWhereClause(`name = '${recipientName}'`));

            if (userExists.length === 0) {
                alert('Вказаного користувача не існує');
                return;
            }
            await Backendless.Files.saveFile(`/user_files/${recipientName}/shared_with_me`, `${fileToShare.name}`, fileToShare.publicUrl, true);
            alert('Ви успішно поділились файлом');
        } catch (error) {
            console.error('Failed to share file:', error);
        } finally {
            handleShareModal(null, false);
        }
    };

    const handleDownloadFile = async (file) => {
        const response = await axios.get(file.publicUrl, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
    }

    const handleExitClick = () => {
        Backendless.UserService.logout().then(() => navigate('/'))
    };

    const handleDirectoryClick = (dirName) => {
        setCurrentDirectory(currentDirectory ? `${currentDirectory}/${dirName}` : dirName);
    };

    const handleBackClick = () => {
        const dirs = currentDirectory.split('/');
        dirs.pop();
        setCurrentDirectory(dirs.join('/'));
    };

    const handleShareModal = (file, isOpen) => {
        setIsShareModalOpen(isOpen);
        if (!isOpen) {
            setRecipientName('');
            setFileToShare('');
        } else {
            setFileToShare(file);
        }
    };

    return (
        <div className="file-manager">
            <h2>Управління файлами <button className="exit-button" onClick={handleExitClick}>Вийти з системи</button>
            </h2>
            {isShareModalOpen && (
                <div className="share-modal">
                    <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)}
                           placeholder="Ім'я користувача"/>
                    <button onClick={handleShareFile}>Поділитися</button>
                    <button onClick={() => setIsShareModalOpen(false)}>Закрити</button>
                </div>
            )}
            <div className="create-folder">
                <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                       placeholder="Ім'я нової папки"/>
                <button onClick={handleCreateFolder}>Створити папку</button>
            </div>
            <div className="actions">
                {currentDirectory && <button onClick={handleBackClick}>Назад</button>}
            </div>
            <ul>
                {directoriesList.map(dir => (
                    <li key={dir.name}>
                        <span>{dir.name}</span>
                        {dir.name !== 'shared_with_me' &&
                            <button onClick={() => handleDelete(dir.name)}>Видалити</button>}
                        <button onClick={() => handleDirectoryClick(dir.name)}>Відкрити</button>
                    </li>
                ))}
                {filesList.map(file => (
                    <li key={file.name}>
                        <span>{file.name}</span>
                        <button onClick={() => handleDelete(file.name)}>Видалити</button>
                        {currentDirectory !== 'shared_with_me' &&
                            <button onClick={() => handleShareModal(file, true)}>Поділитися</button>}
                        <button className="select-file-button" onClick={() => handleDownloadFile(file)}>Завантажити</button>
                    </li>
                ))}
            </ul>
            <div className="custom-file-input">
                <input id="file-upload" type="file" onChange={handleUploadFile}/>
            </div>
        </div>
    );
}

export default FileManager;
