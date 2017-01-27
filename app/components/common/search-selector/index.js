import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Modal,
  ScrollView,
  TextInput
} from 'react-native';

import config from 'config/theme';
import styles from './styles';

class SearchSelector extends Component {
  constructor() {
    super();

    this.state = {
      list: false,
      searchValue: ''
    };
  }

  onOptionSelected() {
  }

  showList() {
    this.setState({ list: true });
  }

  hideList() {
    this.setState({ list: false });
  }

  render() {
    return (
      <View>
        <View style={styles.searchBox}>
          <TouchableHighlight
            onPress={() => this.showList()}
            activeOpacity={0.5}
            underlayColor="transparent"
          >
            <Text style={styles.searchText}>Brazil</Text>
          </TouchableHighlight>
        </View>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.list}
          onRequestClose={() => this.onOptionSelected()}
        >
          <View style={styles.modal}>
            <View style={styles.search}>
              <TextInput
                value={this.state.inputValue}
                autoCapitalize="none"
                placeholder={this.props.placeholder}
                autoCorrect={false}
                style={styles.searchInput}
                placeholderTextColor={config.fontColors.light}
                selectionColor={config.colors.color1}
                autoFocus
              />
            </View>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {this.props.data.map((item, key) =>
                (
                  <Text style={styles.listItem} key={key}>{item.name}</Text>
                )
              )}
            </ScrollView>
            <TouchableHighlight
              onPress={() => this.hideList()}
              activeOpacity={0.5}
              underlayColor="transparent"
            >
              <Text style={styles.searchText}>Close</Text>
            </TouchableHighlight>
          </View>
        </Modal>
      </View>
    );
  }
}

SearchSelector.propTypes = {
  placeholder: React.PropTypes.string.isRequired,
  data: React.PropTypes.array.isRequired
};

export default SearchSelector;
