import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _courses } from '@reducers/actions';
import { theme } from '@constants';
import { TOfficialCourse } from '@backend/courses';
import { getCurrentTerm, getTermOptions } from '@services/coursesService';
import { Icon, RadioList, FormattedInput } from '@components';

const AddCoursePage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const isEnrolling = useSelector((state: TRedux) => state.courses.isEnrolling);
  const isSearchingCourses = useSelector((state: TRedux) => state.courses.isSearchingCourses);
  const courseSearchResults = useSelector((state: TRedux) => state.courses.courseSearchResults);

  const [searchText, setSearchText] = React.useState<string>('');
  const [selectedCourse, setSelectedCourse] = React.useState<TOfficialCourse>(null);
  const [requestMode, setRequestMode] = React.useState<boolean>(false);
  const [requestCode, setRequestCode] = React.useState<string>('');
  const [requestTitle, setRequestTitle] = React.useState<string>('');
  const [term, setTerm] = React.useState<string>(getCurrentTerm());

  const termOptions = React.useMemo(() => getTermOptions(), []);

  const dispatch = useDispatch();
  const dispatchSearch = React.useCallback((query: string) => dispatch(_courses.searchCourses(user, query)), [
    dispatch,
    user
  ]);
  const dispatchEnroll = React.useCallback(
    () =>
      dispatch(
        requestMode
          ? _courses.enroll(user, {
              courseCode: requestCode,
              courseTitle: requestTitle,
              requestNew: true,
              term
            })
          : _courses.enroll(user, {
              courseCode: selectedCourse?.code,
              term
            })
      ),
    [dispatch, requestMode, user, requestCode, requestTitle, term, selectedCourse]
  );

  // wait for a pause in typing before hitting the catalog search endpoint
  React.useEffect(() => {
    const query = searchText.trim();

    if (query.length < 2) {
      return;
    }

    const timeout = setTimeout(() => dispatchSearch(query), 300);

    return () => clearTimeout(timeout);
  }, [dispatchSearch, searchText]);

  const readyToSave = React.useMemo(
    () => term !== '' && (requestMode ? requestCode.trim() !== '' : selectedCourse !== null),
    [requestCode, requestMode, selectedCourse, term]
  );

  const onChangeSearchText = React.useCallback((text: string) => {
    setSearchText(text);
    setSelectedCourse(null);
  }, []);

  const onChangeRequestCode = React.useCallback((text: string) => {
    setRequestCode(text);
  }, []);

  const onChangeRequestTitle = React.useCallback((text: string) => {
    setRequestTitle(text);
  }, []);

  const onChangeTerm = React.useCallback((chosen: string) => {
    setTerm(chosen);
  }, []);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isEnrolling} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Add Class</Text>
        </View>

        <View style={styles.saveWrapper}>
          {isEnrolling ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSave ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSave}
              onPress={dispatchEnroll}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderSearchSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Find your class</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <FormattedInput
              placeholderText="ex: CS 374 or algorithms"
              maxLength={64}
              value={searchText}
              onChangeText={onChangeSearchText}
            />

            <Text style={styles.description}>
              Search the official university catalog by course code or title, then pick your class from the results.
            </Text>

            {isSearchingCourses && <ActivityIndicator style={styles.searchLoader} color={theme.COLORS.PRIMARY} />}

            {courseSearchResults.map((course) => (
              <TouchableOpacity key={course._id} activeOpacity={0.6} onPress={() => setSelectedCourse(course)}>
                <View
                  style={[styles.resultContainer, selectedCourse?._id === course._id && styles.resultContainerSelected]}
                >
                  <View style={styles.resultTextWrapper}>
                    <Text style={styles.resultCode}>{course.code}</Text>
                    <Text style={styles.resultTitle} numberOfLines={1}>
                      {course.title}
                    </Text>
                  </View>

                  {selectedCourse?._id === course._id && (
                    <Icon family="Feather" name="check" size={20} color={theme.COLORS.PRIMARY} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {searchText.trim().length >= 2 && !isSearchingCourses && courseSearchResults.length === 0 && (
              <Text style={styles.emptyText}>No matching classes in the catalog</Text>
            )}

            <TouchableOpacity activeOpacity={0.6} onPress={() => setRequestMode(true)}>
              <Text style={styles.toggleText}>Can't find it? Request a new class</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderRequestSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Course Code</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <FormattedInput
              placeholderText="ex: CS 374"
              maxLength={16}
              value={requestCode}
              onChangeText={onChangeRequestCode}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Course Title</Text>
            </View>

            <FormattedInput
              placeholderText="ex: Introduction to Algorithms"
              maxLength={128}
              value={requestTitle}
              onChangeText={onChangeRequestTitle}
            />

            <Text style={styles.description}>
              Requested classes are marked as pending until an officer approves them. Use this only if your class isn't
              in the catalog search.
            </Text>

            <TouchableOpacity activeOpacity={0.6} onPress={() => setRequestMode(false)}>
              <Text style={styles.toggleText}>Back to catalog search</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderTermSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Term</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <RadioList options={termOptions} selected={term} onChange={onChangeTerm} />

            <Text style={styles.description}>
              Choose the semester you are taking or took the class. Your past semesters stay visible so brothers can
              find people who already took a course.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDivider = () => {
    return (
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>{renderHeader()}</View>

      <View style={styles.content}>
        <View style={styles.section}>{requestMode ? renderRequestSection() : renderSearchSection()}</View>

        {renderDivider()}

        <View style={styles.termSection}>{renderTermSection()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    position: 'absolute',
    height: 44,
    top: 0,
    left: 0,
    right: 0,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    fontFamily: 'OpenSans',
    fontSize: 16
  },
  saveWrapper: {
    position: 'absolute',
    right: 0
  },
  saveText: {
    paddingHorizontal: 16,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: theme.COLORS.PRIMARY
  },
  saveLoader: {
    paddingHorizontal: 16
  },
  cancelWrapper: {
    position: 'absolute',
    left: 0
  },
  cancelText: {
    paddingHorizontal: 16,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: theme.COLORS.DARK_GRAY
  },
  content: {
    marginTop: 44,
    minHeight: 560,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8
  },
  section: {
    flex: 1.4
  },
  termSection: {
    flex: 1
  },
  sectionContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8
  },
  scrollContent: {
    paddingBottom: 16
  },
  propertyHeaderContainer: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row'
  },
  propertyHeader: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  propertyHeaderRequired: {
    marginLeft: 2,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.PRIMARY
  },
  description: {
    marginTop: 12,
    fontFamily: 'OpenSans',
    fontSize: 12
  },
  searchLoader: {
    marginTop: 12,
    alignSelf: 'flex-start'
  },
  resultContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: theme.COLORS.LIGHT_BORDER,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultContainerSelected: {
    borderColor: theme.COLORS.PRIMARY,
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY
  },
  resultTextWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  resultCode: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14
  },
  resultTitle: {
    marginLeft: 8,
    flexShrink: 1,
    fontFamily: 'OpenSans',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  emptyText: {
    marginTop: 12,
    fontFamily: 'OpenSans',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  toggleText: {
    marginTop: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    color: theme.COLORS.PRIMARY
  },
  dividerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    flexGrow: 1,
    borderLeftColor: theme.COLORS.LIGHT_BORDER,
    borderLeftWidth: 1
  }
});

export default AddCoursePage;
