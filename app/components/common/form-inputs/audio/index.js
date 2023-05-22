// @flow

import React from 'react';
import {
  Text,
  View,
  Platform,
  PermissionsAndroid,
  ScrollView,
  KeyboardAvoidingView,
  TouchableHighlight,
  Alert,
  Image,
  Keyboard
} from 'react-native';
import styles from './styles';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType
} from 'react-native-audio-recorder-player';
import { RecordingView } from './recordingView';
import { IdleView } from './idleView';
import { PlayBackView } from './playbackView';
import TextInput from '../text';
import type { Answer, Question } from 'types/reports.types';
import { storeReportFiles } from 'helpers/report-store/storeReportFiles';
import { REPORT_BLOB_AUDIO_ATTACHMENT_PRESENT } from 'helpers/forms';
import { listAnswerAttachments, getAudioExtension } from 'helpers/report-store/reportFilePaths';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { toFileUri } from 'helpers/fileURI';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import i18n from 'i18next';
import { ControllerButtons } from './controllerButtons';
import type { EventSubscription } from 'react-native/Libraries/vendor/emitter/EventEmitter';
import { trackVoiceRecordingStates } from 'helpers/analytics';

const closeIcon = require('assets/voice/recording_close.png');
const checkIcon = require('assets/voice/recording_submit.png');
const closeIconDisabled = require('assets/voice/recording_close_disabled.png');
const checkIconDisabled = require('assets/voice/recording_submit_disabled.png');
const microphoneIcon = require('assets/microphone.png');
const pauseIcon = require('assets/pause.png');
const playIcon = require('assets/playIcon.png');
const forward10Icon = require('assets/forward_10.png');
const backward10Icon = require('assets/backward_10.png');
const addRecordingIcon = require('assets/addRecording.png');

export type RecordingStatus = 'IDLE' | 'RECORDING' | 'PAUSED' | 'STOPPED';

type Props = {
  answer: Answer,
  onChange: Answer => void,
  reportName: string,
  question: Question
};

type State = {
  status: RecordingStatus,
  submitted: boolean,
  uri: ?string,
  createdDate: Date,
  recordingDuration: string,
  playSpec: {
    currentPositionSec: number,
    currentDurationSec: number,
    playTime: string,
    duration: string
  },
  permitted: boolean,
  methodDecided: boolean,
  keyboardShowing: boolean
};

export class AudioInput extends React.Component<Props, State> {
  audioRecorderPlayer: any;
  path: any;
  keyboardShowSubscription: EventSubscription;
  keyboardHideSubscription: EventSubscription;

  constructor(props: Props) {
    super(props);

    const attachments = listAnswerAttachments(
      this.props.reportName,
      this.props.answer.questionName,
      `audio/${getAudioExtension()}`,
      this.props.answer.value || []
    );
    this.state = {
      status: 'IDLE',
      submitted: attachments.length > 0,
      uri: attachments.length > 0 ? attachments[0] : undefined,
      createdDate: attachments.length > 0 ? new Date(props.answer.value[0].date) : new Date(),
      recordingDuration: '',
      playSpec: {
        currentPositionSec: 0,
        currentDurationSec: 0,
        playTime: '00:00',
        duration: 'N/A'
      },
      permitted: true,
      methodDecided: attachments.length > 0,
      keyboardShowing: false
    };
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.path = Platform.select({ ios: undefined, android: undefined });
  }

  startRecording: () => Promise<void> = async () => {
    // Android Permissions
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ]);
        if (
          (Platform.version >= 33 &&
            (grants['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED ||
              grants['android.permission.READ_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED)) ||
          grants['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          this.setState({ permitted: false });
          console.warn('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      const grants = await check(PERMISSIONS.IOS.MICROPHONE);
      if (grants === RESULTS.DENIED || grants === RESULTS.BLOCKED) {
        this.setState({ permitted: false });
        console.warn('All required permissions not granted');
        return;
      }
    }

    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.MPEG_4
    };

    await this.audioRecorderPlayer
      .startRecorder(this.path, audioSet)
      .then(uri => {
        this.audioRecorderPlayer.addRecordBackListener(e => {
          this.setState({
            recordingDuration: this.audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)).substring(0, 5)
          });
        });

        this.setState({
          status: 'RECORDING',
          uri
        });
        trackVoiceRecordingStates('started');
        return true;
      })
      .catch(error => {
        if (error.message.includes('not granted')) {
          this.setState({ permitted: false });
        }
      });
  };

  pauseRecording: () => Promise<void> = async () => {
    await this.audioRecorderPlayer.pauseRecorder();
    this.setState({ status: 'PAUSED' });
    trackVoiceRecordingStates('paused');
  };

  resumeRecording: () => Promise<void> = async () => {
    await this.audioRecorderPlayer.resumeRecorder();
    this.setState({ status: 'RECORDING' });
  };

  stopRecording: () => Promise<void> = async () => {
    await this.audioRecorderPlayer.stopRecorder();
    await this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({ status: 'STOPPED' });
  };

  addPlayListener: () => void = () => {
    this.audioRecorderPlayer.addPlayBackListener(e => {
      const currentTime = this.audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)).substring(0, 5);
      this.setState({
        playSpec: {
          currentPositionSec: e.currentPosition,
          currentDurationSec: e.duration,
          playTime: currentTime === '-1:-1' ? '00:00' : currentTime,
          duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)).substring(0, 5)
        }
      });
      if (e.currentPosition === e.duration) {
        this.setState({ status: 'STOPPED' });
      }
    });
  };

  startPlaying: () => Promise<void> = async () => {
    await this.audioRecorderPlayer.startPlayer(this.state.uri && toFileUri(this.state.uri));
    this.setState({ status: 'RECORDING' });
    this.addPlayListener();
  };

  resumePlaying: () => Promise<void> = async () => {
    await this.audioRecorderPlayer.resumePlayer();
    this.setState({ status: 'RECORDING' });
  };

  pausePlaying: () => Promise<void> = async () => {
    await this.audioRecorderPlayer.pausePlayer();
    this.setState({ status: 'PAUSED' });
  };

  stopPlaying: () => Promise<void> = async () => {
    await this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
    this.setState({ status: 'STOPPED' });
  };

  seekForward: () => Promise<void> = async () => {
    if (this.state.status === 'STOPPED') {
      await this.startPlaying();
      await this.pausePlaying();
    }
    let newValue = this.state.playSpec.currentPositionSec + 10000;
    if (newValue >= this.state.playSpec.currentDurationSec) {
      newValue = this.state.playSpec.currentDurationSec - 100;
    }
    await this.audioRecorderPlayer.seekToPlayer(newValue);
    this.setState({
      playSpec: {
        ...this.state.playSpec,
        currentPositionSec: newValue,
        playTime: this.audioRecorderPlayer.mmssss(Math.floor(newValue)).substring(0, 5)
      }
    });
  };

  seekBackward: () => Promise<void> = async () => {
    if (this.state.status === 'STOPPED') {
      await this.startPlaying();
      await this.pausePlaying();
    }
    let newValue = this.state.playSpec.currentPositionSec - 10000;
    if (newValue < 0) {
      newValue = 0;
    }
    await this.audioRecorderPlayer.seekToPlayer(newValue);
    this.setState({
      playSpec: {
        ...this.state.playSpec,
        currentPositionSec: newValue,
        playTime: this.audioRecorderPlayer.mmssss(Math.floor(newValue)).substring(0, 5)
      }
    });
  };

  seekTo: (value: number) => Promise<void> = async value => {
    if (this.state.status === 'STOPPED') {
      await this.startPlaying();
      await this.pausePlaying();
    }
    if (value >= this.state.playSpec.currentDurationSec) {
      await this.audioRecorderPlayer.seekToPlayer(value - 100);
    } else {
      await this.audioRecorderPlayer.seekToPlayer(value);
    }
  };

  handleSubmitRecording: () => Promise<void> = async () => {
    await this.stopRecording();
    await this.stopPlaying();
    await storeReportFiles([
      {
        reportName: this.props.reportName,
        questionName: this.props.answer.questionName,
        type: `audio/${getAudioExtension()}`,
        path: decodeURI(this.state.uri || ''),
        size: 0
      }
    ]);
    const date = new Date();
    this.props.onChange({
      ...this.props.answer,
      value: [...this.props.answer.value, { type: REPORT_BLOB_AUDIO_ATTACHMENT_PRESENT, date }]
    });

    this.setState({
      submitted: true,
      playSpec: {
        ...this.state.playSpec,
        duration: this.state.recordingDuration.substring(0, 5),
        playTime: '00:00'
      },
      createdDate: date
    });
    trackVoiceRecordingStates('completed');
  };

  handleDeleteRecording: () => Promise<void> = async () => {
    if (this.state.submitted) {
      trackVoiceRecordingStates('deleted');
    } else {
      trackVoiceRecordingStates('canceled');
    }
    await this.stopRecording();
    await this.stopPlaying();
    this.setState({
      status: 'STOPPED',
      submitted: false,
      uri: undefined,
      recordingDuration: '00:00',
      playSpec: {
        currentPositionSec: 0,
        currentDurationSec: 0,
        playTime: '00:00',
        duration: '00:00'
      },
      methodDecided: false
    });

    this.props.onChange({
      ...this.props.answer,
      value: []
    });
  };

  onChildChange: (value: string) => void = value => {
    this.props.onChange({
      ...this.props.answer,
      child: value
    });
  };

  onRecordPress: () => Promise<empty> = async () =>
    !this.state.uri
      ? await this.startRecording()
      : this.state.uri && this.state.status === 'RECORDING'
      ? await this.pauseRecording()
      : await this.resumeRecording();

  onPlayPress: () => Promise<empty> = async () =>
    this.state.status === 'PAUSED'
      ? await this.resumePlaying()
      : this.state.status === 'STOPPED' || this.state.status === 'IDLE'
      ? await this.startPlaying()
      : await this.pausePlaying();

  componentWillUnmount: () => void = () => {
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.stopRecorder();
    this.keyboardHideSubscription.remove();
    this.keyboardShowSubscription.remove();
  };

  componentDidMount: () => void = () => {
    this.keyboardShowSubscription = Keyboard.addListener('keyboardDidShow', () => {
      this.setState({ keyboardShowing: true });
    });
    this.keyboardHideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      this.setState({ keyboardShowing: false });
    });
  };

  render: () => React$Element<any> = () => {
    const canSubmit = this.state.uri !== undefined;

    return (
      <KeyboardAvoidingView behavior="position" style={styles.container}>
        {!this.state.methodDecided ? (
          <>
            <View style={styles.preview}>
              <Text style={styles.captureLabel}>{i18n.t('report.voice.recordingEmptyState')}</Text>
            </View>
            <TouchableHighlight
              disabled={
                this.props.question.maxImageCount
                  ? this.props.answer?.value.length >= this.props.question.maxImageCount
                  : this.props.answer?.value.length >= 5
              }
              underlayColor="transparent"
              style={styles.leftBtn}
              onPress={() => {
                Alert.alert(
                  i18n.t('report.voice.chooseRecordingTitle'),
                  i18n.t('report.voice.chooseRecordingSubtitle'),
                  [
                    {
                      text: i18n.t('report.voice.startRecording'),
                      onPress: () => {
                        this.setState({ methodDecided: true });
                      }
                    },
                    {
                      text: i18n.t('report.voice.uploadRecording'),
                      onPress: () => {
                        DocumentPicker.pickSingle({
                          type: DocumentPicker.types.audio
                        }).then(async data => {
                          const uri =
                            Platform.OS === 'android' ? data.uri : decodeURI(data.uri).replace('file:///', '');
                          const fileName = uri.substring(uri.lastIndexOf('/') + 1);
                          const tempPath = RNFS.TemporaryDirectoryPath + '/' + fileName;
                          if (await RNFS.exists(tempPath)) {
                            await RNFS.unlink(tempPath);
                          }
                          await RNFS.copyFile(uri, tempPath);
                          this.setState({
                            uri: tempPath,
                            methodDecided: true
                          });
                          this.handleSubmitRecording();
                          return true;
                        });
                      }
                    }
                  ],
                  {
                    cancelable: true
                  }
                );
              }}
              activeOpacity={0.8}
            >
              <Image style={styles.leftBtnIcon} source={addRecordingIcon} />
            </TouchableHighlight>
          </>
        ) : (
          <ScrollView style={{ paddingBottom: 230 }}>
            <Text style={styles.question}>{this.props.question.label}</Text>
            <View style={styles.recordingBox}>
              {this.state.submitted ? (
                <PlayBackView
                  date={this.state.createdDate
                    ?.toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' })
                    ?.toUpperCase()}
                  filename="Recording"
                  playSpec={this.state.playSpec}
                  onDeletePressed={() => {
                    this.handleDeleteRecording();
                  }}
                  onSeek={this.seekTo}
                />
              ) : this.state.status === 'IDLE' || (this.state.status === 'STOPPED' && !this.state.uri) ? (
                <IdleView />
              ) : (
                <RecordingView status={this.state.status} time={this.state.recordingDuration} />
              )}
              <ControllerButtons
                canSubmit={canSubmit}
                leftButtonIcon={this.state.submitted ? backward10Icon : !canSubmit ? closeIconDisabled : closeIcon}
                leftButtonPress={this.state.submitted ? this.seekBackward : this.handleDeleteRecording}
                middleButtonIcon={
                  this.state.status === 'RECORDING' || this.state.status === 'PLAYING'
                    ? pauseIcon
                    : !this.state.submitted
                    ? microphoneIcon
                    : playIcon
                }
                permitted={this.state.permitted}
                submitted={this.state.submitted}
                middleButtonPress={!this.state.submitted ? this.onRecordPress : this.onPlayPress}
                rightButtonIcon={this.state.submitted ? forward10Icon : !canSubmit ? checkIconDisabled : checkIcon}
                rightButtonPress={this.state.submitted ? this.seekForward : this.handleSubmitRecording}
              />
            </View>
            {this.props.question.childQuestion && (
              <TextInput
                question={this.props.question.childQuestion}
                onChange={this.onChildChange}
                placeHolder={i18n.t('report.voice.enterDescriptionHint')}
                answer={this.props.answer.child || {}}
                containerStyle={{ marginTop: 28, marginBottom: this.state.keyboardShowing ? 160 : 28, flex: 0 }}
                labelStyle={{ fontSize: 16, marginTop: 0, marginBottom: 4 }}
              />
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    );
  };
}
