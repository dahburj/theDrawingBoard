import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import './Login.scss';

export default function Login(props) {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = () => {
    if (props.socketOpen) {
      console.log('attempting to log in')
      console.log(email, password)
      props.socket.emit('loginAttempt', { email: email, password: password });
    }
  };

  const handleRegister = () => {
    if (props.socketOpen) {
      console.log('attempting to register');
      console.log(username, email, password, confirmPassword);
      if (password === confirmPassword) {
        props.socket.emit('registrationAttempt', { username: username, email: email, password: password });
      } else {
        console.log('could not register');
      }
    }
  };

  const onEnter = (event, form) => {
    if (event.charCode === 13) {
      if (form === 'login') {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  };

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('loginResponse', (data) => {
        if (data.user && data.user.id) {
          console.log(data);
          console.log("Attempting to set cookie");
          document.cookie = `sid=${data.session.sid}`
          document.cookie = `iv=${data.session.iv}`;
          console.log(document.cookie);
          props.setUser(data.user);
        }
      });

      props.socket.on('WelcomeYaBogeyBastard', res => {
        console.log('registration success! logging in now', res);
        props.socket.emit('loginAttempt', { email: res.email, password: password })
      })

      return () => {
        props.socket.off('loginResponse');
        props.socket.off('WelcomeYaBogeyBastard');
      }
    }
  });

  return (
    <div className={`container ${!showLogin ? 'active-panel' : ''}`} id="container">
      <div className="form-container sign-up-container">
        <div className='form'>

          <Typography variant='h2' color='primary'>Register</Typography>
          <TextField
            label="Username"
            color="secondary"
            value={username}
            onChange={event => setUsername(event.target.value)}
          />
          <TextField
            label="Email"
            color="secondary"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
          <TextField
            label="Password"
            color="secondary"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={event => setPassword(event.target.value)}
            InputProps={{
              endAdornment:
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
            }}
          />
          <TextField
            label="Confirm Password"
            color="secondary"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onKeyPress={event => onEnter(event, 'register')}
            onChange={event => setConfirmPassword(event.target.value)}
            InputProps={{
              endAdornment:
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
            }}
          />
          <Button className='login-button' variant="contained" color='secondary' onClick={handleRegister}>Register</Button>
        </div>
      </div>
      <div className="form-container sign-in-container">
        <div className='form'>
          <Typography variant='h2' color='primary'>Login</Typography>
          <TextField
            label="Email"
            color="secondary"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
          <TextField
            label="Password"
            color="secondary"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={event => setPassword(event.target.value)}
            onKeyPress={event => onEnter(event, 'login')}
            InputProps={{
              endAdornment:
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
            }}
          />
          <Button className='login-button' variant="contained" color='secondary' onClick={handleLogin}>Login</Button>
        </div>
      </div>
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-top">
            <Typography variant='h2' color='secondary'>Welcome Back!</Typography>
            <Typography variant='overline'>Please login with your personal info</Typography>
            <Button variant='contained' id="signIn" onClick={() => setShowLogin(true)}>Sign In</Button>
          </div>
          <div className="overlay-panel overlay-bottom">
            <Typography variant='h2' color='secondary'>Hello, Friend!</Typography>
            <Typography variant='overline'>Start your journey with us</Typography>
            <Button variant='contained' id="signUp" onClick={() => setShowLogin(false)}>Sign Up</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
