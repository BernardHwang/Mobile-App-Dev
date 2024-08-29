/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './AddEvent';
import App2 from './App2.tsx';
import App3 from './App3.tsx';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';

AppRegistry.registerComponent(appName, () => App3);