import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import App from './src/App';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

if (__DEV__) {
  import('@/reactotron.config');
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

AppRegistry.registerComponent(appName, () => App);
