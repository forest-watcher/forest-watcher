//@flow

import React from 'react';
import { View, ScrollView, Text, Alert, Linking } from 'react-native';
import ActionButton from 'components/common/action-button';
import Hyperlink from 'react-native-hyperlink';
import i18n from 'i18next';
import Theme from 'config/theme';
import styles from './styles';
import showDeleteModal from 'helpers/showDeleteModal';
import type { Team } from 'types/teams.types';
import type { UserState } from 'types/user.types';
import { launchAppRoot } from 'screens/common';
import Config from 'react-native-config';

type Props = {
  teams: Array<Team>,
  user: UserState,
  logout: () => void
};

const DeleteAccount = (props: Props): React$Element<any> => {
  if (props.user.deleted) {
    props.logout();
    launchAppRoot('ForestWatcher.Login');
    return null;
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.faq}>
          <Text style={styles.faqTitle}>{i18n.t('deleteAccount.heading')}</Text>

          <Text style={styles.faqText} selectable>
            {i18n.t('deleteAccount.body1')}
          </Text>

          {i18n
            .t('deleteAccount.bullet1')
            .split('\n')
            .map((text, key) => (
              <View key={key} style={styles.faqList}>
                <View style={styles.faqDotList} />
                <Text style={styles.faqText} selectable>
                  {text}
                </Text>
              </View>
            ))}

          <Text style={styles.faqText} selectable>
            {i18n.t('deleteAccount.body2')}
          </Text>

          {i18n
            .t('deleteAccount.bullet2')
            .split('\n')
            .map((text, key) => (
              <View key={key} style={styles.faqList}>
                <View style={styles.faqDotList} />
                <Text style={styles.faqText} selectable>
                  {text}
                </Text>
              </View>
            ))}

          <Hyperlink linkDefault linkStyle={Theme.link} linkText={i18n.t('deleteAccount.footerLinkText')}>
            <Text style={styles.faqText} selectable>
              {i18n.t('deleteAccount.footer')}
            </Text>
          </Hyperlink>

          <View style={styles.buttonsContainer}>
            <ActionButton
              delete
              style={styles.actionBtn}
              onPress={() => {
                if (!props.teams.find(x => x.userRole === 'administrator')) {
                  showDeleteModal(
                    i18n.t('deleteAccount.confirmationTitle'),
                    i18n.t('deleteAccount.confirmationBody'),
                    i18n.t('deleteAccount.confirmationNegative'),
                    i18n.t('deleteAccount.confirmationPositive'),
                    () => {
                      fetch(`${Config.API_AUTH}/auth/user/${props.user.userId}`, {
                        method: 'DELETE',
                        headers: {
                          Authorization: props.user.token || '',
                          'Content-Type': 'application/json'
                        }
                      })
                        .then(res => res.json())
                        .then(data => {
                          if (data.errors && data.errors.length > 0 && data.errors[0].status === 403) {
                            Alert.alert(i18n.t('deleteAccount.failedMessage'));
                          } else {
                            Alert.alert(i18n.t('deleteAccount.scheduleDeletionTitle'), null, [
                              {
                                text: i18n.t('deleteAccount.ok'),
                                onPress: () => {
                                  props.logout();
                                  launchAppRoot('ForestWatcher.Login');
                                }
                              }
                            ]);
                          }
                          return true;
                        })
                        .catch(error => {
                          Alert.alert(i18n.t('deleteAccount.failedMessage'));
                        });
                    }
                  );
                } else {
                  Alert.alert(i18n.t('deleteAccount.failedMessage'), i18n.t('deleteAccount.adminErrorMessage'), [
                    {
                      text: i18n.t('deleteAccount.ok')
                    },
                    {
                      text: i18n.t('deleteAccount.openLink'),
                      onPress: () => {
                        Linking.openURL('http://forestwatcher.globalforestwatch.org');
                      }
                    }
                  ]);
                }
              }}
              text={i18n.t('deleteAccount.deleteButton')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

DeleteAccount.options = (passProps: {}): any => {
  return {
    topBar: {
      title: {
        text: i18n.t('deleteAccount.title')
      }
    }
  };
};

export { DeleteAccount };
