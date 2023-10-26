import { registerRootComponent } from 'expo';
import { AppRegistry, YellowBox, LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Some warning message to ignore',
  // Add other warning messages to ignore here
]);

  
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
