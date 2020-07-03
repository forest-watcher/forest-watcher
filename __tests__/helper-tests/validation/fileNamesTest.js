import 'react-native';

import fileNameIsValid from '../../../app/helpers/validation/fileNames';

const exampleFiles = [
  {
    id: '1',
    uri: 'testuri',
    path: 'testpath',
    type: 'testtype',
    fileName: 'testfilename',
    size: 123,
    name: 'Test1'
  },
  {
    id: '2',
    uri: 'testuri',
    path: 'testpath',
    type: 'testtype',
    fileName: 'testfilename',
    size: 123,
    name: 'Test2'
  },
  {
    id: '3',
    uri: 'testuri',
    path: 'testpath',
    type: 'testtype',
    fileName: 'testfilename',
    size: 123,
    name: 'Test3'
  }
];

describe('fileNames', () => {
  describe('func fileNameIsValid', () => {
    describe('when no files already exist', () => {
      it('returns invalid when provided with a null name', () => {
        expect(fileNameIsValid('4', null, [], 5)).toMatchSnapshot();
      });

      it('returns valid when provided with a file that has a short name', () => {
        expect(fileNameIsValid('4', 'A', [], 5)).toMatchSnapshot();
      });

      it('returns valid when provided with a file name just below the length limit', () => {
        expect(fileNameIsValid('4', 'Test', [], 5)).toMatchSnapshot();
      });

      it('returns valid when provided with a file name on the length limit', () => {
        expect(fileNameIsValid('4', 'Test4', [], 5)).toMatchSnapshot();
      });

      it('returns invalid when provided with a file name just above the length limit', () => {
        expect(fileNameIsValid('4', 'Test-4', [], 5)).toMatchSnapshot();
      });

      it('returns invalid when provided with a file name above the length limit', () => {
        expect(fileNameIsValid('4', 'Test--4', [], 5)).toMatchSnapshot();
      });
    });

    describe('when files already exist', () => {
      it('returns valid when the file & name do not already exist', () => {
        expect(fileNameIsValid('4', 'Test4', exampleFiles, 5)).toMatchSnapshot();
      });

      // Tests an edge-case where if we attempt to give an existing file its previous name,
      // we shouldn't mark it as invalid.
      it('returns valid when the file exists & the name matches', () => {
        expect(fileNameIsValid('3', 'Test3', exampleFiles, 5)).toMatchSnapshot();
      });

      it('returns invalid when the file does not exist & the name matches', () => {
        expect(fileNameIsValid('4', 'Test3', exampleFiles, 5)).toMatchSnapshot();
      });
    });
  });
});
