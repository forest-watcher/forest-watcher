import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique UUID string
 *
 * @return {String}
 */
export default function generateUniqueID() {
  const guid = uuidv4();
  return guid;
}
