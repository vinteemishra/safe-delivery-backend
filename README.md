# Safe delivery API

This directory contains the Safe Delivery REST API

Build status: [![CircleCI](https://circleci.com/bb/visikon/sda-api.svg?style=svg&circle-token=a1a268fe558936f4ebff881aa233a2d891af7017)](https://circleci.com/bb/visikon/sda-api)

## Running Dynamodb locally

```
brew install dynamodb-local
dynamodb-local
```

## Running

To run dev server

Need a recent version of Node installed:

```
npm install
npm start
```

## User Management

Use the AWS CLI. Assume a profile exists with the id maternity

Create new user:

```
aws cognito-idp admin-create-user --profile maternity  --username jeppe@ingolfs.dk --user-pool-id eu-west-1_xouwbnClY --temporary-password Qazxsw12! --user-attributes Name=email,Value=jeppe@ingolfs.dk
aws cognito-idp admin-initiate-auth --profile maternity --user-pool-id eu-west-1_xouwbnClY --client-id 7tcsi7r7tmcr7jdv9amc563ba7 --auth-flow ADMIN_NO_SRP_AUTH --auth-parameters USERNAME=jeppe@ingolfs.dk,PASSWORD=Qazxsw12!
aws cognito-idp respond-to-auth-challenge --profile maternity --client-id 7tcsi7r7tmcr7jdv9amc563ba7 --challenge-name NEW_PASSWORD_REQUIRED --challenge-responses USERNAME=jeppe@ingolfs.dk,NEW_PASSWORD=Samsung2013# --session <...>
```

Setting the role:

```
aws cognito-idp admin-update-user-attributes --profile maternity --user-pool-id eu-west-1_xouwbnClY --username=jeppe@visikon.com --user-attributes Name=custom:cmsrole,Value=admin
```

## TODO

- Get correct sourcemaps
- Pre-compile babel
- npm shrinkwrap

## TEST


