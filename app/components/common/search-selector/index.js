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

function getFilteredData(data, filter) {
  if (!filter) return data;
  const filterUpper = filter.toUpperCase();
  return data.filter((item) => item.name.toUpperCase().indexOf(filterUpper) > -1 );
}

class SearchSelector extends Component {
  constructor() {
    super();

    this.state = {
      showList: false,
      searchValue: ''
    };
  }

  onFilterChange = (text) => {
    this.setState({ searchValue: text });
  }

  onOptionSelected(country) {
    this.props.onOptionSelected({
      name: country.name,
      iso: country.iso
    });
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
    return (
      <View>
        <View style={styles.searchBox}>
          <TouchableHighlight
            onPress={() => this.setListVisibility(true)}
            activeOpacity={0.5}
            underlayColor="transparent"
          >
            <Text style={styles.searchText}>{this.props.selected.label}</Text>
          </TouchableHighlight>
        </View>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.showList}
          onRequestClose={() => this.close()}
        >
          <View style={styles.modal}>
            <TouchableHighlight
              style={styles.closeButton}
              onPress={() => this.close()}
              activeOpacity={0.5}
              underlayColor="transparent"
            >
              <Image source={require('assets/close.png')} />
            </TouchableHighlight>
            <View style={styles.search}>
              <TextInput
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                value={this.state.inputValue}
                placeholder={this.props.placeholder}
                style={styles.searchInput}
                placeholderTextColor={Theme.fontColors.light}
                selectionColor={Theme.colors.color1}
                onChangeText={this.onFilterChange}
              />
            </View>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {getFilteredData(this.props.data, this.state.searchValue).map((item, key) =>
                (<Text
                    key={key}
                    style={styles.listItem}
                    onPress={() => this.onOptionSelected(item)}
                  >
                    {item.name}
                  </Text>)
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
  data: React.PropTypes.array.isRequired
};

export default SearchSelector;
