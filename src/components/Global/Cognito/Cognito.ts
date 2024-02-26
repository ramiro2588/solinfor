import {CognitoUserPool} from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: process.env.REACT_APP_SOLINFOR_AWS_COGNITO_USER_POOL_ID!,
    ClientId: process.env.REACT_APP_SOLINFOR_AWS_COGNITO_CLIENT_ID!,
};
const userPool = new CognitoUserPool(poolData);

export {userPool};