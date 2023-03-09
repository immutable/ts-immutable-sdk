# sample-app

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

The provider sample app tests the MetaMask provider functionality.

## Yalc Setup

The `ts-immutable-sdk` is imported via yalc. 

To install yalc run

```
npm i -g yalc
```

From the root directory of the `ts-immutable-sdk` run

```
yalc publish
```

From within the sample-app root directory run

```
yalc add ts-immutable-sdk
npm install
```

If changes are made to `ts-immutable-sdk` in the root directory of the sdk after already publishing run

```
yalc push
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
