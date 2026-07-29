import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _courses } from '@reducers/actions';
import { theme } from '@constants';
import { TCourse } from '@backend/courses';
import { shouldLoad } from '@services/kappaService';
import {
  ADVICE_CATEGORIES,
  getCurrentTerm,
  getUserEnrollment,
  groupEnrollmentsByTerm,
  isWebChair
} from '@services/coursesService';
import Icon from '@components/Icon';
import AdviceItem from '@components/AdviceItem';

const CourseItem: React.FC<{ course: TCourse }> = ({ course }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const loadHistory = useSelector((state: TRedux) => state.courses.loadHistory);
  const courseIdToAdvice = useSelector((state: TRedux) => state.courses.courseIdToAdvice);
  const isGettingAdvice = useSelector((state: TRedux) => state.courses.isGettingAdvice);
  const getAdviceError = useSelector((state: TRedux) => state.courses.getAdviceError);
  const isEnrolling = useSelector((state: TRedux) => state.courses.isEnrolling);
  const isUnenrolling = useSelector((state: TRedux) => state.courses.isUnenrolling);
  const isApprovingCourse = useSelector((state: TRedux) => state.courses.isApprovingCourse);
  const isRejectingCourse = useSelector((state: TRedux) => state.courses.isRejectingCourse);
  const isDeletingCourse = useSelector((state: TRedux) => state.courses.isDeletingCourse);

  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [showPastTerms, setShowPastTerms] = React.useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('ALL');
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const [confirmingReject, setConfirmingReject] = React.useState<boolean>(false);

  const currentTerm = React.useMemo(() => getCurrentTerm(), []);

  const webChair = React.useMemo(() => isWebChair(user), [user]);

  const myEnrollment = React.useMemo(() => getUserEnrollment(course, user.email, currentTerm), [
    course,
    currentTerm,
    user.email
  ]);

  const termGroups = React.useMemo(() => groupEnrollmentsByTerm(course.enrollments), [course.enrollments]);

  const currentTermGroup = React.useMemo(() => termGroups.find((group) => group.term === currentTerm), [
    currentTerm,
    termGroups
  ]);

  const pastTermGroups = React.useMemo(() => termGroups.filter((group) => group.term !== currentTerm), [
    currentTerm,
    termGroups
  ]);

  const adviceList = React.useMemo(() => courseIdToAdvice[course._id] || [], [course._id, courseIdToAdvice]);

  const visibleAdvice = React.useMemo(
    () => (categoryFilter === 'ALL' ? adviceList : adviceList.filter((advice) => advice.category === categoryFilter)),
    [adviceList, categoryFilter]
  );

  const dispatch = useDispatch();
  const dispatchGetAdvice = React.useCallback(() => dispatch(_courses.getCourseAdvice(user, course._id)), [
    course._id,
    dispatch,
    user
  ]);
  const dispatchEnroll = React.useCallback(
    () => dispatch(_courses.enroll(user, { courseId: course._id, term: currentTerm })),
    [course._id, currentTerm, dispatch, user]
  );
  const dispatchApprove = React.useCallback(() => {
    setConfirmingReject(false);
    dispatch(_courses.approveCourse(user, course._id));
  }, [course._id, dispatch, user]);
  const dispatchReject = React.useCallback(() => dispatch(_courses.rejectCourse(user, course._id)), [
    course._id,
    dispatch,
    user
  ]);
  const dispatchDeleteCourse = React.useCallback(() => dispatch(_courses.deleteCourse(user, course._id)), [
    course._id,
    dispatch,
    user
  ]);
  const dispatchUnenroll = React.useCallback(() => dispatch(_courses.unenroll(user, myEnrollment?._id, course._id)), [
    course._id,
    dispatch,
    myEnrollment,
    user
  ]);
  const dispatchAddAdvice = React.useCallback(() => dispatch(_courses.editAdvice(course._id)), [course._id, dispatch]);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingAdvice && (force || (!getAdviceError && shouldLoad(loadHistory, `advice-${course._id}`))))
        dispatchGetAdvice();
    },
    [course._id, dispatchGetAdvice, getAdviceError, isGettingAdvice, loadHistory]
  );

  const onPressExpand = React.useCallback(() => {
    setExpanded(!expanded);
    setConfirmingDelete(false);
    setConfirmingReject(false);
  }, [expanded]);

  React.useEffect(() => {
    if (expanded) {
      loadData(false);
    }
  }, [expanded, loadData]);

  const getBrotherName = React.useCallback(
    (email: string) => {
      const brother = directory[email];

      return brother ? `${brother.givenName} ${brother.familyName}` : email;
    },
    [directory]
  );

  const renderRoster = () => {
    return (
      <React.Fragment>
        <Text style={styles.sectionHeader}>Taking it {currentTerm}</Text>

        {currentTermGroup ? (
          <Text style={styles.rosterName}>
            {currentTermGroup.enrollments.map((enrollment) => getBrotherName(enrollment.email)).join('  ·  ')}
          </Text>
        ) : (
          <Text style={styles.emptyText}>No one yet this semester</Text>
        )}

        {pastTermGroups.length > 0 && (
          <TouchableOpacity activeOpacity={0.6} onPress={() => setShowPastTerms(!showPastTerms)}>
            <Text style={styles.toggleText}>
              {showPastTerms ? 'Hide past semesters' : `Show past semesters (${pastTermGroups.length})`}
            </Text>
          </TouchableOpacity>
        )}

        {showPastTerms &&
          pastTermGroups.map((group) => (
            <React.Fragment key={group.term}>
              <Text style={styles.sectionHeader}>{group.term}</Text>
              <Text style={styles.rosterName}>
                {group.enrollments.map((enrollment) => getBrotherName(enrollment.email)).join('  ·  ')}
              </Text>
            </React.Fragment>
          ))}
      </React.Fragment>
    );
  };

  const renderAdvice = () => {
    return (
      <React.Fragment>
        <View style={styles.adviceHeaderRow}>
          <Text style={styles.sectionHeader}>Advice</Text>

          <TouchableOpacity activeOpacity={0.6} onPress={dispatchAddAdvice}>
            <Text style={styles.actionText}>Add Advice</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {[{ id: 'ALL', title: 'All' }, ...ADVICE_CATEGORIES].map((category) => (
            <TouchableOpacity key={category.id} activeOpacity={0.6} onPress={() => setCategoryFilter(category.id)}>
              <View style={[styles.filterPill, categoryFilter === category.id && styles.filterPillActive]}>
                <Text style={[styles.filterPillText, categoryFilter === category.id && styles.filterPillTextActive]}>
                  {category.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {isGettingAdvice && adviceList.length === 0 ? (
          <ActivityIndicator style={styles.adviceLoader} color={theme.COLORS.PRIMARY} />
        ) : visibleAdvice.length === 0 ? (
          <Text style={styles.emptyText}>
            {adviceList.length === 0 ? 'No advice yet, be the first to help out!' : 'No advice in this category'}
          </Text>
        ) : (
          visibleAdvice.map((advice) => <AdviceItem key={advice._id} advice={advice} courseId={course._id} />)
        )}
      </React.Fragment>
    );
  };

  const renderAdminActions = () => {
    return (
      <View style={styles.adminRow}>
        {course.approved === false && (
          <React.Fragment>
            {isApprovingCourse ? (
              <ActivityIndicator style={styles.adminAction} color={theme.COLORS.PRIMARY} />
            ) : (
              <TouchableOpacity activeOpacity={0.6} disabled={isRejectingCourse} onPress={dispatchApprove}>
                <Text style={[styles.actionText, styles.adminAction, isRejectingCourse && styles.disabledAction]}>
                  Approve this class
                </Text>
              </TouchableOpacity>
            )}

            {isRejectingCourse ? (
              <ActivityIndicator style={styles.adminAction} color={theme.COLORS.PRIMARY_RED} />
            ) : (
              <TouchableOpacity
                activeOpacity={0.6}
                disabled={isApprovingCourse}
                onPress={confirmingReject ? dispatchReject : () => setConfirmingReject(true)}
              >
                <Text style={[styles.deleteText, styles.adminAction, isApprovingCourse && styles.disabledAction]}>
                  {confirmingReject ? 'Confirm reject (removes all enrollments and advice)' : 'Reject this class'}
                </Text>
              </TouchableOpacity>
            )}
          </React.Fragment>
        )}

        {course.approved !== false &&
          webChair &&
          (isDeletingCourse ? (
            <ActivityIndicator style={styles.adminAction} color={theme.COLORS.PRIMARY_RED} />
          ) : (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={confirmingDelete ? dispatchDeleteCourse : () => setConfirmingDelete(true)}
            >
              <Text style={[styles.deleteText, styles.adminAction]}>
                {confirmingDelete ? 'Confirm delete (removes all enrollments and advice)' : 'Delete this class'}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    );
  };

  const renderExpanded = () => {
    return (
      <View style={styles.expandedContent}>
        <View style={styles.enrollRow}>
          {isEnrolling || isUnenrolling ? (
            <ActivityIndicator color={theme.COLORS.PRIMARY} />
          ) : myEnrollment ? (
            <TouchableOpacity activeOpacity={0.6} onPress={dispatchUnenroll}>
              <Text style={styles.actionText}>Drop this class ({currentTerm})</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={0.6} onPress={dispatchEnroll}>
              <Text style={styles.actionText}>I'm taking this class ({currentTerm})</Text>
            </TouchableOpacity>
          )}
        </View>

        {((user.privileged === true && course.approved === false) || webChair) && renderAdminActions()}

        {renderRoster()}
        {renderAdvice()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.4} onPress={onPressExpand}>
        <View style={styles.courseContainer}>
          <View style={styles.courseHeader}>
            <View style={styles.selectIcon}>
              {course.approved === false && <Text style={styles.pendingLabel}>Pending approval</Text>}
              {myEnrollment && <Text style={styles.enrolledLabel}>Enrolled</Text>}
              <Text style={styles.takingLabel}>
                {currentTermGroup ? `${currentTermGroup.enrollments.length} taking` : ''}
              </Text>
              <Icon family="MaterialIcons" name="keyboard-arrow-right" size={36} color={theme.COLORS.PRIMARY} />
            </View>
          </View>

          <View style={styles.courseNameContainer}>
            <Text style={styles.courseCode}>{course.code}</Text>
            {course.title !== '' && <Text style={styles.courseTitle}>{course.title}</Text>}
          </View>
        </View>
      </TouchableOpacity>

      {expanded && renderExpanded()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  courseContainer: {
    height: 48
  },
  courseHeader: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  courseNameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
    backgroundColor: theme.COLORS.WHITE
  },
  courseCode: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 16,
    color: theme.COLORS.BLACK
  },
  courseTitle: {
    marginLeft: 8,
    fontFamily: 'OpenSans',
    fontSize: 15,
    color: theme.COLORS.DARK_GRAY
  },
  selectIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  enrolledLabel: {
    marginRight: 12,
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.PRIMARY_GREEN,
    textTransform: 'uppercase'
  },
  pendingLabel: {
    marginRight: 12,
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.WARNING,
    textTransform: 'uppercase'
  },
  takingLabel: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.GRAY,
    textTransform: 'uppercase'
  },
  expandedContent: {
    marginBottom: 16
  },
  enrollRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 14,
    color: theme.COLORS.PRIMARY
  },
  deleteText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 14,
    color: theme.COLORS.PRIMARY_RED
  },
  adminRow: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  disabledAction: {
    opacity: 0.4
  },
  adminAction: {
    marginRight: 24
  },
  sectionHeader: {
    marginTop: 12,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  rosterName: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 15
  },
  emptyText: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  toggleText: {
    marginTop: 8,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    color: theme.COLORS.PRIMARY
  },
  adviceHeaderRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  filterRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  filterPill: {
    marginRight: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY,
    borderColor: theme.COLORS.LIGHT_BORDER,
    borderWidth: 1
  },
  filterPillActive: {
    backgroundColor: theme.COLORS.PRIMARY,
    borderColor: theme.COLORS.PRIMARY
  },
  filterPillText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
  },
  filterPillTextActive: {
    color: theme.COLORS.WHITE
  },
  adviceLoader: {
    marginTop: 8,
    alignSelf: 'flex-start'
  }
});

export default CourseItem;
