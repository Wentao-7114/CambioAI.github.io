import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ChooseCategory from './ChooseCategory';
import DocumentParsing from './DocumentParsing';
import { Auth0Provider } from '@auth0/auth0-react';
import { TourProvider } from './components/TourContext';

const domain = process.env.REACT_APP_AUTH0_DOMAIN!;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID!;
const redirectUri = window.location.origin;
// const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN!;
// const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!;
const secret = process.env.NEXT_PUBLIC_AUTH0_SECRET!;
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Auth0Provider domain={domain} clientId={clientId}
    authorizationParams={{ redirect_uri: window.location.origin }}
    >



    <Router basename={process.env.PUBLIC_URL}>
    <TourProvider>
        <Routes>
          <Route path="/" element={<App />} />
        <Route path="/chooseCategory" element={<ChooseCategory />} />
        <Route path="/documentParsing" element={<DocumentParsing />} />
      </Routes>
      </TourProvider>
    </Router>
</Auth0Provider>

  </React.StrictMode>,


);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
