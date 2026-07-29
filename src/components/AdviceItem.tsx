import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _courses } from '@reducers/actions';
import { theme } from '@constants';
import { TAdvice } from '@backend/courses';
import { getAdviceCategoryTitle, isWebChair } from '@services/coursesService';
import Icon from '@components/Icon';

const AdviceItem: React.FC<{ advice: TAdvice; courseId: string }> = ({ advice, courseId }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const isDeletingAdvice = useSelector((state: TRedux) => state.courses.isDeletingAdvice);

  const isAuthor = React.useMemo(() => advice.email !== '' && advice.email === user.email, [advice.email, user.email]);

  const authorName = React.useMemo(() => {
    if (advice.email === '') {
      return 'Anonymous';
    }

    const brother = directory[advice.email];
    const name = brother ? `${brother.givenName} ${brother.familyName}` : advice.email;

    // the author is only visible on anonymous advice to the author themselves and privileged users
    return advice.anonymous ? `Anonymous (${name})` : name;
  }, [advice.anonymous, advice.email, directory]);

  const dispatch = useDispatch();
  const dispatchEditAdvice = React.useCallback(() => dispatch(_courses.editAdvice(courseId, advice._id)), [
    advice._id,
    courseId,
    dispatch
  ]);
  const dispatchDeleteAdvice = React.useCallback(() => dispatch(_courses.deleteAdvice(user, courseId, advice._id)), [
    advice._id,
    courseId,
    dispatch,
    user
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.categoryLabel}>{getAdviceCategoryTitle(advice.category)}</Text>
          {advice.professor !== '' && <Text style={styles.professorLabel}>{advice.professor}</Text>}
          {!!advice.term && <Text style={styles.termLabel}>Took it {advice.term}</Text>}
        </View>

        <View style={styles.headerRight}>
          {isAuthor && (
            <TouchableOpacity activeOpacity={0.6} disabled={isDeletingAdvice} onPress={dispatchEditAdvice}>
              <Icon style={styles.iconButton} family="Feather" name="edit" size={17} color={theme.COLORS.PRIMARY} />
            </TouchableOpacity>
          )}
          {(isAuthor || isWebChair(user)) &&
            (isDeletingAdvice ? (
              <ActivityIndicator style={styles.iconButton} color={theme.COLORS.PRIMARY} />
            ) : (
              <TouchableOpacity activeOpacity={0.6} onPress={dispatchDeleteAdvice}>
                <Icon
                  style={styles.iconButton}
                  family="Feather"
                  name="trash-2"
                  size={17}
                  color={theme.COLORS.PRIMARY}
                />
              </TouchableOpacity>
            ))}
        </View>
      </View>

      <Text style={styles.adviceText}>{advice.text}</Text>

      <Text style={styles.attribution}>
        {authorName} · {moment(advice.createdAt).format('M/D/YY')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryLabel: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    color: theme.COLORS.PRIMARY
  },
  professorLabel: {
    marginLeft: 8,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  termLabel: {
    marginLeft: 8,
    fontFamily: 'OpenSans',
    fontSize: 13,
    color: theme.COLORS.GRAY
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    marginLeft: 12,
    width: 17
  },
  adviceText: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 15
  },
  attribution: {
    marginTop: 6,
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.GRAY
  }
});

export default AdviceItem;
