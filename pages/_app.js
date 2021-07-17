import App from 'next/app';
import firebase from '../firebase/index';
import { FirebaseContext } from '../firebase/index';
import useAuthentication from '../hooks/useAuthentication';
import '../styles/globals.css'

const MyApp = props => {
  const usuario = useAuthentication();
  const {Component, pageProps} = props;

  return (<FirebaseContext.Provider value={
    {firebase, usuario}
  }>
    <Component {...pageProps}/>
  </FirebaseContext.Provider>)
};

export default MyApp
