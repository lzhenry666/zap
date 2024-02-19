import React from 'react'
import './Login.css'
import Api from '../../Api'
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
const Login = ({ onReceive }) => { // Certifique-se de receber onReceive como prop

    const handleFacebookLogin = async () => {
        try {
          let newUser = await Api.fbPopup();
          if (newUser) {
            onReceive(newUser);
          } else {
            alert('Erro ao logar com o Facebook!');
          }
        } catch (error) {
          console.error('Erro no login do Facebook:', error);
          alert('Erro ao logar com o Facebook!');
        }

    }

    const handleGoogleLogin = async () => {
        let result = await Api.glgPopup();
        if (result) {
            console.log(result.user)
            onReceive(result.user);
        } else {
            alert('Erro ao logar com o Google');
        }
    }

    const handleGitHubLogin = async () => {
        let result = await Api.gthbPopup();
        if (result) {
            console.log(result.user)
            onReceive(result.user);
        } else {
            alert('Erro ao logar com o Google');
        }
    }
    return (
        <div className="login">
            <div className="login-options">
                <div className="login-title">Faça o seu Login</div>
                <div className="btn face-btn" onClick={handleFacebookLogin}>
                    <FacebookIcon className="btn-icon"/>
                    <div className="btn-title">Logar com o Facebook</div>
                </div>
                <div className="btn google-btn" onClick={handleGoogleLogin}>
                    <GoogleIcon className="btn-icon"/>
                    <div className="btn-title">Logar com o Google</div>
                </div>
                <div className="btn github-btn" onClick={handleGitHubLogin}>
                    <GitHubIcon className="btn-icon"/>
                    <div className="btn-title">Logar com o GitHub</div>
                </div>
            </div>
        </div>
    );
}

export default Login
