import React, { Component } from 'react';
import Backendless from 'backendless';

class ForgotPassword extends Component {
    state = {
        email: '',
        error: '',
        success: ''
    };

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        const { email } = this.state;

        try {
            const response = await Backendless.UserService.restorePassword(email);
            console.log('Password restoration response:', response); // Вивід відповіді
            this.setState({ success: 'Перевірте свою електронну пошту для відновлення пароля', error: '' });
        } catch (error) {
            console.error('Error restoring password:', error);
            this.setState({ error: 'Помилка під час відновлення пароля: ' + error.message, success: '' });
        }
    };

    render() {
        const { email, error, success } = this.state;

        return (
            <div>
                <h2>Відновлення забутого пароля</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <label>Email:</label>
                        <input type="email" name="email" value={email} onChange={this.handleChange} required />
                    </div>
                    <button type="submit">Відновити пароль</button>
                </form>
            </div>
        );
    }
}

export default ForgotPassword;
