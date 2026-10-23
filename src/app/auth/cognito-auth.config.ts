import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { CookieStorage } from 'aws-amplify/utils';

export const cognitoAuthConfig = {
  userPoolId: 'us-east-1_J2QcA3F4h',
  userPoolClientId: '4pm00jligbe4hfb3iveset5nmc',
  domain: 'us-east-1j2qca3f4h.auth.us-east-1.amazoncognito.com',
  redirectUrls: [
    'https://acombs-dev.com/',
    'https://www.acombs-dev.com/',
    'https://main.d89oebcblu3jd.amplifyapp.com/',
    'http://localhost:4200/',
  ],
};

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoAuthConfig.userPoolId,
      userPoolClientId: cognitoAuthConfig.userPoolClientId,
      loginWith: {
        oauth: {
          domain: cognitoAuthConfig.domain,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: cognitoAuthConfig.redirectUrls,
          redirectSignOut: cognitoAuthConfig.redirectUrls,
          responseType: 'code',
        },
      },
    },
  },
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    path: '/',
    expires: 7,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
  }),
);
