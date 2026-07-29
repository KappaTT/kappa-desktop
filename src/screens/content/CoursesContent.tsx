import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused, NavigationProp } from '@react-navigation/native';

import { TRedux } from '@reducers';
import { _courses, _kappa, _nav } from '@reducers/actions';
import { TCourse } from '@backend/courses';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { shouldLoad } from '@services/kappaService';
import { getCurrentTerm, getUserEnrollment, groupCoursesBySubject } from '@services/coursesService';
import { Header, Icon, CourseItem } from '@components';

// react-native-elements' SearchBar typings incorrectly require every default-provided prop
const TypedSearchBar = (SearchBar as unknown) as React.FC<any>;

const CoursesContent: React.FC<{
  navigation: NavigationProp<any, 'Courses'>;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.courses.loadHistory);
  const courseArray = useSelector((state: TRedux) => state.courses.courseArray);
  const isGettingCourses = useSelector((state: TRedux) => state.courses.isGettingCourses);
  const getCoursesError = useSelector((state: TRedux) => state.courses.getCoursesError);
  const getCoursesErrorMessage = useSelector((state: TRedux) => state.courses.getCoursesErrorMessage);
  const kappaLoadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const isGettingDirectory = useSelector((state: TRedux) => state.kappa.isGettingDirectory);
  const getDirectoryError = useSelector((state: TRedux) => state.kappa.getDirectoryError);

  const dispatch = useDispatch();
  const dispatchGetCourses = React.useCallback(() => dispatch(_courses.getCourses(user)), [dispatch, user]);
  const dispatchGetDirectory = React.useCallback(() => dispatch(_kappa.getDirectory(user)), [dispatch, user]);
  const dispatchShowAddCourse = React.useCallback(() => dispatch(_courses.showAddCourse()), [dispatch]);
  const dispatchSetSelectedPage = React.useCallback((routeName) => dispatch(_nav.setSelectedPage(routeName)), [
    dispatch
  ]);

  const scrollRef = React.useRef(undefined);

  const refreshing = React.useMemo(() => isGettingCourses || isGettingDirectory, [
    isGettingCourses,
    isGettingDirectory
  ]);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingCourses && (force || (!getCoursesError && shouldLoad(loadHistory, 'courses'))))
        dispatchGetCourses();
      if (!isGettingDirectory && (force || (!getDirectoryError && shouldLoad(kappaLoadHistory, 'directory'))))
        dispatchGetDirectory();
    },
    [
      isGettingCourses,
      getCoursesError,
      loadHistory,
      dispatchGetCourses,
      isGettingDirectory,
      getDirectoryError,
      kappaLoadHistory,
      dispatchGetDirectory
    ]
  );

  const onRefresh = React.useCallback(() => {
    loadData(true);
  }, [loadData]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [isFocused, loadData, user.sessionToken]);

  React.useEffect(() => {
    if (isFocused) {
      dispatchSetSelectedPage('Courses');
    }
  }, [dispatchSetSelectedPage, isFocused]);

  const [searchText, setSearchText] = React.useState<string>('');
  const [showOnlyMine, setShowOnlyMine] = React.useState<boolean>(false);
  const [expandedSubjects, setExpandedSubjects] = React.useState<{ [subject: string]: boolean }>({});

  const currentTerm = React.useMemo(() => getCurrentTerm(), []);

  const visibleCourses = React.useMemo(() => {
    let courses = courseArray;

    if (showOnlyMine) {
      courses = courses.filter((course) => getUserEnrollment(course, user.email, currentTerm) !== undefined);
    }

    if (searchText.trim() !== '') {
      const search = searchText.trim().toLowerCase();

      courses = courses.filter(
        (course) => course.code.toLowerCase().includes(search) || course.title.toLowerCase().includes(search)
      );
    }

    return courses;
  }, [courseArray, currentTerm, searchText, showOnlyMine, user.email]);

  const subjectGroups = React.useMemo(() => groupCoursesBySubject(visibleCourses), [visibleCourses]);

  // searching or filtering to your own classes leaves few matches, so keep every group open for those
  const forceExpanded = React.useMemo(() => searchText.trim() !== '' || showOnlyMine, [searchText, showOnlyMine]);

  const onPressSubject = React.useCallback((subject: string) => {
    setExpandedSubjects((expanded) => ({
      ...expanded,
      [subject]: !expanded[subject]
    }));
  }, []);

  const keyExtractor = React.useCallback((item: { subject: string; courses: TCourse[] }) => item.subject, []);

  const renderItem = ({ item }: { item: { subject: string; courses: TCourse[] } }) => {
    const expanded = forceExpanded || expandedSubjects[item.subject] === true;
    const enrolledInSubject = item.courses.some(
      (course) => getUserEnrollment(course, user.email, currentTerm) !== undefined
    );

    return (
      <React.Fragment>
        <TouchableOpacity activeOpacity={0.4} disabled={forceExpanded} onPress={() => onPressSubject(item.subject)}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subjectTitle}>{item.subject}</Text>

            <View style={styles.subjectRight}>
              {enrolledInSubject && <Text style={styles.subjectEnrolledLabel}>Enrolled</Text>}
              <Text style={styles.subjectCountLabel}>
                {item.courses.length} {item.courses.length === 1 ? 'class' : 'classes'}
              </Text>
              <Icon
                family="MaterialIcons"
                name={expanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                size={36}
                color={theme.COLORS.PRIMARY}
              />
            </View>
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.subjectCourses}>
            {item.courses.map((course) => (
              <CourseItem key={course._id} course={course} />
            ))}
          </View>
        )}
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Courses">
        <View style={styles.headerChildren}>
          <View style={styles.headerSearchBarContainer}>
            <TypedSearchBar
              round={true}
              autoCapitalize="none"
              autoCorrect={false}
              lightTheme={true}
              placeholder="Search Courses..."
              containerStyle={{
                backgroundColor: 'transparent',
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent'
              }}
              inputContainerStyle={{
                backgroundColor: 'transparent',
                height: 35
              }}
              inputStyle={{
                fontSize: 14
              }}
              onChangeText={(text: string) => setSearchText(text)}
              value={searchText}
            />
          </View>

          <View style={styles.headerButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} onPress={() => setShowOnlyMine(!showOnlyMine)}>
              <View style={[styles.myClassesPill, showOnlyMine && styles.myClassesPillActive]}>
                <Text style={[styles.myClassesPillText, showOnlyMine && styles.myClassesPillTextActive]}>
                  My Classes
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} onPress={dispatchShowAddCourse}>
              <Text style={styles.headerButtonText}>Add Class</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.refreshContainer}>
            {refreshing ? (
              <ActivityIndicator style={styles.refreshIcon} color={theme.COLORS.PRIMARY} />
            ) : (
              <TouchableOpacity onPress={onRefresh}>
                <Icon
                  style={styles.refreshIcon}
                  family="Feather"
                  name="refresh-cw"
                  size={17}
                  color={theme.COLORS.PRIMARY}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Header>

      <View style={styles.content}>
        <FlatList
          ref={(ref) => (scrollRef.current = ref)}
          data={subjectGroups}
          extraData={expandedSubjects}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={
            <React.Fragment>
              <Text style={styles.errorMessage}>
                {(courseArray.length === 0 && getCoursesErrorMessage) ||
                  (searchText.trim() !== ''
                    ? 'No matching courses'
                    : showOnlyMine
                    ? "You aren't enrolled in any classes this semester"
                    : 'No classes yet, add the first one!')}
              </Text>
            </React.Fragment>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerChildren: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  refreshContainer: {},
  refreshIcon: {
    margin: 8,
    width: 17
  },
  headerButtonContainer: {
    marginRight: 8
  },
  headerButtonText: {
    fontFamily: 'OpenSans',
    fontSize: 14,
    color: theme.COLORS.PRIMARY
  },
  content: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0
  },
  errorMessage: {
    marginTop: '40vh',
    textAlign: 'center',
    fontFamily: 'OpenSans'
  },
  headerSearchBarContainer: {
    marginTop: 8,
    marginBottom: 8
  },
  subjectContainer: {
    marginHorizontal: 16,
    height: 48,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  subjectTitle: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 17,
    color: theme.COLORS.BLACK
  },
  subjectRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  subjectEnrolledLabel: {
    marginRight: 12,
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.PRIMARY_GREEN,
    textTransform: 'uppercase'
  },
  subjectCountLabel: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.GRAY,
    textTransform: 'uppercase'
  },
  subjectCourses: {
    paddingLeft: 16
  },
  myClassesPill: {
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY,
    borderColor: theme.COLORS.LIGHT_BORDER,
    borderWidth: 1
  },
  myClassesPillActive: {
    backgroundColor: theme.COLORS.PRIMARY,
    borderColor: theme.COLORS.PRIMARY
  },
  myClassesPillText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
  },
  myClassesPillTextActive: {
    color: theme.COLORS.WHITE
  }
});

export default CoursesContent;
