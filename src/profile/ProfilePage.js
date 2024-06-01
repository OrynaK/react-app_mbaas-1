import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import Backendless from 'backendless';
import './ProfilePage.css';
import Places from './Places';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [fileDirectory, setFileDirectory] = useState([]);
    const [chosenFile, setChosenFile] = useState('');
    const [avatarLink, setAvatarLink] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [locationTracking, setLocationTracking] = useState(false);
    const [placesUpdated, setPlacesUpdated] = useState(false);

    const handlePlacesUpdated = () => {
        setPlacesUpdated(!placesUpdated);
    };

    useEffect(() => {
        retrieveUserData();
    }, []);

    useEffect(() => {
        if (profile) {
            retrieveFileDirectory();
            setLocationTracking(profile.trackLocation || false);
        }
    }, [profile]);

    const retrieveUserData = async () => {
        try {
            const activeUser = await Backendless.UserService.getCurrentUser();
            setProfile(activeUser);
            setAvatarLink(activeUser.avatarUrl);
        } catch (error) {
            console.error('Error in fetching user data:', error);
        }
    };

    const retrieveFileDirectory = async () => {
        try {
            const directory = await Backendless.Files.listing(`/user_files/${profile.name}`);
            const imageFiles = directory.filter(file =>
                file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')
            );
            setFileDirectory(imageFiles);
        } catch (error) {
            console.error('Error in fetching files:', error);
        }
    };

    const handleFileSelection = (fileUrl) => {
        setChosenFile(fileUrl);
    };

    const handleAvatarSave = async () => {
        if (!chosenFile) {
            setErrorMsg('Please select a file for the avatar');
            return;
        }
        try {
            profile.avatarUrl = chosenFile;
            await Backendless.UserService.update(profile);
            setAvatarLink(chosenFile);
            setErrorMsg('');
        } catch (error) {
            console.error('Failed to save avatar:', error);
            setErrorMsg('Error during avatar save');
        }
    };

    const handleLocationTrackingChange = async (e) => {
        const {checked} = e.target;
        setLocationTracking(checked);
        try {
            profile.trackLocation = checked;
            await Backendless.UserService.update(profile);
        } catch (error) {
            console.error('Failed to update track location:', error);
        }
    };

    const updateLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const {latitude, longitude} = position.coords;
                console.log(latitude, longitude);
                const updatedUser = {
                    ...profile,
                    my_location: new Backendless.Data.Point(latitude, longitude)
                };
                console.log(updatedUser);
                try {
                    await Backendless.UserService.update(updatedUser);
                    setProfile(updatedUser); // Оновлюємо локальний стан користувача
                } catch (error) {
                    console.error('Failed to update location:', error);
                }
            }, (error) => {
                console.error('Failed to get geolocation:', error);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    return (
        <div className="container">
            <h2>User Profile</h2>
            {profile ? (
                <div className="userInfo">
                    {errorMsg && <p style={{color: 'red'}}>{errorMsg}</p>}
                    <div className="avatarContainer">
                        <img src={avatarLink} alt="Avatar" className="avatar"/>
                        <div>
                            <h3>Select a file for the avatar:</h3>
                            <ul className="fileList">
                                {fileDirectory.map((file) => (
                                    <li key={file.publicUrl} className="fileItem">
                                        <span>{file.name}</span>
                                        <button className="button"
                                                onClick={() => handleFileSelection(file.publicUrl)}>Select
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {chosenFile && (
                                <div className="selectedFilePreview">
                                    <h3>Selected file:</h3>
                                    <img src={chosenFile} alt="Selected avatar" className="selectedFileImage"/>
                                    <button className="button" onClick={handleAvatarSave}>Save avatar</button>
                                </div>
                            )}
                            {errorMsg && <p style={{color: 'red'}}>{errorMsg}</p>}
                        </div>
                    </div>
                    <div>
                        <h3>Current user data:</h3>
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                    </div>
                    <div>
                        <input type="checkbox" name="trackLocation" checked={locationTracking}
                               onChange={handleLocationTrackingChange}/>
                        <label>Track my location</label>
                        <button onClick={updateLocation}>Update Location</button>
                    </div>
                    <Link to="/editProfile" className="button">Edit profile</Link>
                    <Link to="/fileManager" className="button">File management</Link>
                    <Places userId={profile.objectId} profile={profile} placesUpdated={placesUpdated} onPlacesUpdated={handlePlacesUpdated}/>
                </div>
            ) : (
                <p>Loading profile data...</p>
            )}
        </div>
    );
};

export default ProfilePage;
