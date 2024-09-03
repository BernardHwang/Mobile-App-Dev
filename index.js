/**
 * @format
 */

import {AppRegistry} from 'react-native';


import App3 from './App3.tsx';
import App from './App';

import {name as appName} from './app.json';
import 'react-native-gesture-handler';

AppRegistry.registerComponent(appName, () => App);