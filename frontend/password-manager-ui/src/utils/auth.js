import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import config from '../config';

const userPool = new CognitoUserPool({
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.userPoolWebClientId
});

export const signUp = (email, password) => {
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, [], null, (err, result) => {
      if (err) reject(err);
      else resolve(result.user);
    });
  });
};

export const confirmSignUp = (email, code) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export const signIn = (email, password) => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => resolve(result),
      onFailure: (err) => reject(err)
    });
  });
};

export const getCurrentUser = () => {
  return userPool.getCurrentUser();
};

export const signOut = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};