// App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Backendless from 'backendless';
import UserFileManager from "./files/UserFileManager";
import RegistrationForm from "./main/RegistrationForm";
import LoginForm from "./main/LoginForm";
import Home from "./Home";
import ForgotPasswordForm from "./main/ForgotPasswordForm";
import ProfilePage from "./profile/ProfilePage";
import EditProfile from "./profile/EditProfile";
import Places from "./profile/Places";

const APP_ID = process.env.REACT_APP_BACKENDLESS_APP_ID;
const API_KEY = process.env.REACT_APP_BACKENDLESS_SECRET_KEY;

Backendless.serverURL = 'https://eu-api.backendless.com';
Backendless.initApp(APP_ID, API_KEY);

function App() {
    useEffect(() => {
        // Ініціалізація Backendless
        Backendless.serverURL = 'https://eu-api.backendless.com';
        Backendless.initApp(APP_ID, API_KEY);
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/users/register" element={<RegistrationForm/>}></Route>
                <Route path="/login" element={<LoginForm/>}></Route>
                <Route path="/password-reset" element={<ForgotPasswordForm/>}></Route>
                <Route path="/fileManager" element={<UserFileManager/>}></Route>
                <Route path="/profile" element={<ProfilePage/>}></Route>
                <Route path="/editProfile" element={<EditProfile/>}></Route>
                <Route path="/myPlaces" element={<Places/>}></Route>

            </Routes>
        </Router>
    );
}

export default App;
