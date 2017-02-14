import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Modal,
  Image,
  ScrollView,
  TextInput
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const searchImage = require('assets/search.png');
const closeImage = require('assets/close.png');

function getFilteredData(data, filter) {
  if (!filter) return data;
  const filterUpper = filter.toUpperCase();
  return data.filter((item) => item.name.toUpperCase().indexOf(filterUpper) > -1);
}

class SearchSelector extends Component {
  constructor() {
    super();

    this.state = {
      showList: false,
      searchValue: ''
    };
    this.onFilterChange = this.onFilterChange.bind(this);
  }

  onFilterChange(text) {
    this.setState({ searchValue: text });
  }

  onOptionSelected(country) {
    this.props.onOptionSelected(country);
    this.close();
  }

  setListVisibility(status) {
    this.setState({ showList: status });
  }

  close() {
    this.setState({
      showList: false,
      searchValue: ''
    });
  }

  render() {
    const placeholder = this.props.selected && this.props.selected.label
      ? this.props.selected.label
      : this.props.placeholder;

    return (
      <View>
        <TouchableHighlight
          onPress={() => this.setListVisibility(true)}
          activeOpacity={0.5}
          underlayColor="transparent"
        >
          <View style={styles.searchContainer}>
            <Text style={styles.searchText}>
              {placeholder}
            </Text>
            <Image style={Theme.icon} source={searchImage} />
          </View>
        </TouchableHighlight>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.showList}
          onRequestClose={() => this.close()}
        >
          <View style={styles.modal}>
            <View style={styles.search}>
              <TextInput
                autoFocus={false}
                autoCapitalize="none"
                autoCorrect={false}
                value={this.state.inputValue}
                placeholder={this.props.placeholder}
                underlineColorAndroid="transparent"
                style={styles.searchInput}
                placeholderTextColor={Theme.fontColors.light}
                selectionColor={Theme.colors.color1}
                onChangeText={this.onFilterChange}
              />
              <TouchableHighlight
                style={styles.closeIcon}
                onPress={() => this.close()}
                activeOpacity={0.5}
                underlayColor="transparent"
              >
                <Image style={Theme.icon} source={closeImage} />
              </TouchableHighlight>
            </View>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
            {getFilteredData(this.props.data, this.state.searchValue).map((item, key) =>
              (
                <TouchableHighlight
                  key={key}
                  style={styles.listItem}
                  onPress={() => this.onOptionSelected(item)}
                  activeOpacity={0.5}
                  underlayColor="transparent"
                >
                  <Text
                    style={styles.listItemText}
                  >
                    {item.name}
                  </Text>
                </TouchableHighlight>
              )
            )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }
}

SearchSelector.propTypes = {
  selected: React.PropTypes.shape({
    label: React.PropTypes.string,
    id: React.PropTypes.string
  }).isRequired,
  placeholder: React.PropTypes.string.isRequired,
  onOptionSelected: React.PropTypes.func.isRequired,
  data: React.PropTypes.array.isRequired
};

export default SearchSelector;
