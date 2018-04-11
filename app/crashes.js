import Crashes, { ErrorAttachmentLog } from 'appcenter-crashes';
import { Navigation } from 'react-native-navigation';
import pick from 'lodash/pick';

export function setExceptionHandlers(store) {
  const storeKeysToSave = ['app'];
  Crashes.setListener({
    // Always send the crashes by default
    shouldAwaitUserConfirmation() {
      return false;
    },
    // Attach the store info in the crash
    getErrorAttachments() {
      if (!store) return undefined; // Default values are used if a method with return parameter is not defined.
      const state = store.getState();
      const storeToSave = pick(state, storeKeysToSave);
      const textContent = JSON.stringify(storeToSave);
      const textAttachment = ErrorAttachmentLog.attachmentWithText(textContent, 'store.txt');
      return [textAttachment];
    }
  });
}

// Check previous crashes after restart to show user feedback
export async function checkPrevCrashes() {
  const didCrash = await Crashes.hasCrashedInLastSession();
  if (didCrash) {
    const closeLightbox = () => Navigation.dismissLightBox;
    const crashReport = await Crashes.lastSessionCrashReport();
    Navigation.showLightBox({
      screen: 'ForestWatcher.ErrorLightbox',
      passProps: { error: crashReport, closeLightbox },
      style: {
        backgroundBlur: 'none',
        tapBackgroundToDismiss: true
      }
    });
  }
}
