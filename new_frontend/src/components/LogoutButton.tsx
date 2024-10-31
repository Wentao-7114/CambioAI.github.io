import React, { useState } from 'react';
import './LogoutButton.css';
import { useAuth0 } from '@auth0/auth0-react';



const LogoutButton: React.FC = () => {

    const { logout, isAuthenticated } = useAuth0();

    if (!isAuthenticated) {
        return null;  // If authenticated, render nothing.
    }

    return (
         isAuthenticated &&
         <button className="logout_button" onClick={() => logout({
             logoutParams: {
                 returnTo: process.env.REACT_APP_AUTH0_LOGOUT_URL
             }
         })}>
            Logout
        </button>
    )
}

export default LogoutButton;
