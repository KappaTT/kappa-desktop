import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _courses } from '@reducers/actions';
import { theme } from '@constants';
import { TAdviceCategory } from '@backend/courses';
import { ADVICE_CATEGORIES, getAdviceTermOptions } from '@services/coursesService';
import { Switch, RadioList, FormattedInput } from '@components';

const EditAdvicePage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const courseArray = useSelector((state: TRedux) => state.courses.courseArray);
  const courseIdToAdvice = useSelector((state: TRedux) => state.courses.courseIdToAdvice);
  const editingAdviceCourseId = useSelector((state: TRedux) => state.courses.editingAdviceCourseId);
  const editingAdviceId = useSelector((state: TRedux) => state.courses.editingAdviceId);
  const isSavingAdvice = useSelector((state: TRedux) => state.courses.isSavingAdvice);

  const course = React.useMemo(() => courseArray.find((candidate) => candidate._id === editingAdviceCourseId), [
    courseArray,
    editingAdviceCourseId
  ]);

  const initialAdvice = React.useMemo(
    () =>
      editingAdviceId === 'NEW'
        ? null
        : (courseIdToAdvice[editingAdviceCourseId] || []).find((candidate) => candidate._id === editingAdviceId),
    [courseIdToAdvice, editingAdviceCourseId, editingAdviceId]
  );

  const [category, setCategory] = React.useState<TAdviceCategory>(initialAdvice?.category || 'GENERAL');
  const [professor, setProfessor] = React.useState<string>(initialAdvice?.professor || '');
  const [term, setTerm] = React.useState<string>(initialAdvice?.term || '');
  const [text, setText] = React.useState<string>(initialAdvice?.text || '');
  const [anonymous, setAnonymous] = React.useState<boolean>(initialAdvice?.anonymous || false);

  const termOptions = React.useMemo(() => {
    const options = getAdviceTermOptions();
    const initialTerm = initialAdvice?.term || '';

    // keep an older term selectable when the advice predates the rolling option window
    if (initialTerm !== '' && !options.find((option) => option.id === initialTerm)) {
      options.push({ id: initialTerm, title: initialTerm });
    }

    return options;
  }, [initialAdvice]);

  const dispatch = useDispatch();
  const dispatchSaveAdvice = React.useCallback(
    () =>
      dispatch(
        _courses.saveAdvice(
          user,
          initialAdvice
            ? {
                category,
                professor,
                term,
                text,
                anonymous
              }
            : {
                courseId: editingAdviceCourseId,
                category,
                professor,
                term,
                text,
                anonymous
              },
          editingAdviceId
        )
      ),
    [dispatch, user, initialAdvice, category, professor, term, text, anonymous, editingAdviceCourseId, editingAdviceId]
  );

  const readyToSave = React.useMemo(() => text.trim() !== '', [text]);

  const onChangeCategory = React.useCallback((chosen: TAdviceCategory) => {
    setCategory(chosen);
  }, []);

  const onChangeProfessor = React.useCallback((newText: string) => {
    setProfessor(newText);
  }, []);

  const onChangeTerm = React.useCallback((chosen: string) => {
    setTerm(chosen);
  }, []);

  const onChangeText = React.useCallback((newText: string) => {
    setText(newText);
  }, []);

  const onChangeAnonymous = React.useCallback((newValue: boolean) => {
    setAnonymous(newValue);
  }, []);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isSavingAdvice} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{initialAdvice === null ? 'Add' : 'Edit'} Advice</Text>
          {course !== undefined && <Text style={styles.subtitleText}>{course.code}</Text>}
        </View>

        <View style={styles.saveWrapper}>
          {isSavingAdvice ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSave ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSave}
              onPress={dispatchSaveAdvice}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderCategorySection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Category</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <RadioList options={ADVICE_CATEGORIES} selected={category} onChange={onChangeCategory} />

            <Text style={styles.description}>
              Pick the topic that best fits your advice so brothers can filter for what they need.
            </Text>

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Professor</Text>
            </View>

            <FormattedInput
              placeholderText="ex: Chekuri"
              maxLength={48}
              value={professor}
              onChangeText={onChangeProfessor}
            />

            <Text style={styles.description}>
              Optionally name the professor your advice applies to, since courses can differ a lot by professor.
            </Text>

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Semester taken</Text>
            </View>

            <RadioList options={termOptions} selected={term} onChange={onChangeTerm} />

            <Text style={styles.description}>
              Optionally share when you took the class so brothers know how current your advice is. If you post
              anonymously, the semester is hidden from other brothers as well.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderTextSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Advice</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <FormattedInput
              style={styles.multilineInput}
              placeholderText="What should the next brother taking this class know?"
              maxLength={2000}
              multiline={true}
              value={text}
              onChangeText={onChangeText}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Post anonymously</Text>
            </View>

            <Switch value={anonymous} onValueChange={onChangeAnonymous} />

            <Text style={styles.description}>
              Your name will be hidden from other brothers. Admins can still see the author of anonymous advice and can
              remove posts that break the rules.
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
        <View style={styles.section}>{renderCategorySection()}</View>

        {renderDivider()}

        <View style={styles.textSection}>{renderTextSection()}</View>
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
  subtitleText: {
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
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
    minHeight: 480,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8
  },
  section: {
    flex: 1
  },
  textSection: {
    flex: 1.4
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
  multilineInput: {
    height: 128
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

export default EditAdvicePage;
