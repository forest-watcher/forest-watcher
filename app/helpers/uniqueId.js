import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique ID based on the current date and a random 
 *
 * @return {String}
 */
export default function generateDateBasedUniqueID() {
  const guid = uuidv4();
  const date = new Date().getTime();
  return guid + '-' + date;
}