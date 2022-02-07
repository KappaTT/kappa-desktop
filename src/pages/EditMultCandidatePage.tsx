import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { Voting } from '@backend';
import { TRedux } from '@reducers';
import { _voting } from '@reducers/actions';
import { TCandidate } from '@backend/voting';
import { theme } from '@constants';
import { prettyPhone } from '@services/kappaService';
import { CLASS_YEAR_OPTIONS } from '@services/votingService';
import { Icon, RadioList, FormattedInput, CheckList, Switch } from '@components';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

const emailFormatter = (text: string) => {
  return text !== undefined ? text.trim() : '';
};

const EditMultCandidatePage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const editingMultCandidateEmail = useSelector((state: TRedux) => state.voting.editingMultCandidateEmail);
  const isSavingCandidate = useSelector((state: TRedux) => state.voting.isSavingCandidate);

  const selectedCandidate = React.useMemo(() => {
    return candidateArray.find((candidate) => candidate.email === editingMultCandidateEmail) || null;
  }, [candidateArray, editingMultCandidateEmail]);

  const [email, setEmail] = React.useState<string>(selectedCandidate?.email || '');
  const [phone, setPhone] = React.useState<string>(selectedCandidate?.phone || '');
  const [givenName, setGivenName] = React.useState<string>(selectedCandidate?.givenName || '');
  const [familyName, setFamilyName] = React.useState<string>(selectedCandidate?.familyName || '');
  const [classYear, setClassYear] = React.useState<TCandidate['classYear']>(selectedCandidate?.classYear || '');
  const [major, setMajor] = React.useState<string>(selectedCandidate?.major || '');
  const [secondTimeRush, setSecondTimeRush] = React.useState<boolean>(selectedCandidate?.secondTimeRush || false);
  const [attendedEvents, setAttendedEvents] = React.useState<string[]>(selectedCandidate?.events || []);

  const [csvFile, setCsvFile] = useState();
  const [csvArray, setCsvArray] = useState([]);
  // [{name: "", age: 0, rank: ""},{name: "", age: 0, rank: ""}]

  const processCSV = (str, delim = ',') => {
    const headers = str.slice(0, str.indexOf('\r')).split(delim);
    const rows = str.slice(str.indexOf('\n') + 1).split('\n');
    console.log(headers);
    console.log(rows);

    const newArray = rows.map((row) => {
      const values = row.split(delim);
      const eachObject = headers.reduce((obj, header, i) => {
        obj[header] = values[i].trim();
        return obj;
      }, {});
      return eachObject;
    });
    console.log(newArray);
    setCsvArray(newArray);
  };

  const submit = () => {
    const file = csvFile;
    const reader = new FileReader();

    reader.onload = function (e) {
      const text = e.target.result;
      console.log(text);
      processCSV(text);
    };

    reader.readAsText(file);
  };

  const dispatch = useDispatch();
  const dispatchSaveCandidate = React.useCallback(
    () =>
      dispatch(
        _voting.saveCandidate(
          user,
          {
            email,
            phone,
            givenName,
            familyName,
            classYear,
            major,
            secondTimeRush,
            events: attendedEvents
          },
          editingMultCandidateEmail !== 'NEW' ? editingMultCandidateEmail : undefined
        )
      ),
    [
      attendedEvents,
      classYear,
      dispatch,
      editingMultCandidateEmail,
      email,
      familyName,
      givenName,
      major,
      phone,
      secondTimeRush,
      user
    ]
  );
  async function saveCandidates() {
    for (const candidateInfo of csvArray) {
      const candidate = {
        email: candidateInfo.email,
        phone: phone,
        givenName: candidateInfo.firstname,
        familyName: candidateInfo.lastname,
        classYear: candidateInfo.classyear,
        major: candidateInfo.major,
        secondTimeRush: candidateInfo.secondtimerush !== '' && candidateInfo.secondtimerush !== 'no' ? true : false,
        events: attendedEvents
      };
      await Voting.createCandidate({ user, candidate }).then((res) => {
        if (res.success) {
          dispatch(_voting.saveSuccess(res.data));
        } else {
          dispatch(_voting.saveFailure(res.error));
        }
      });
    }
  }

  const emailIsDuplicate = React.useMemo(() => {
    if (email !== editingMultCandidateEmail) {
      if (candidateArray.find((candidate) => candidate.email === email)) {
        return true;
      }
      const uniqueValues = new Set(csvArray.map((candidate) => candidate.email));

      if (uniqueValues.size < csvArray.length) {
        return true;
      }
    }

    return false;
  }, [candidateArray, editingMultCandidateEmail, email, csvArray]);

  //   const readyToSave = React.useMemo(
  //     () =>
  //       !(
  //         email === '' ||
  //         emailIsDuplicate ||
  //         email.indexOf('@') === -1 ||
  //         email.indexOf('.') === -1 ||
  //         givenName === '' ||
  //         familyName === '' ||
  //         prettyPhoneValue === 'Invalid' ||
  //         classYear === ''
  //       ),
  //     [classYear, email, emailIsDuplicate, familyName, givenName, prettyPhoneValue]
  //   );

  const readyToSave = React.useMemo(() => !(csvArray.length === 0 || emailIsDuplicate), [csvArray]);

  const prettyPhoneValue = React.useMemo(() => prettyPhone(phone), [phone]);
  const selectedEvents = React.useMemo(() => {
    const events = {};

    for (const event of attendedEvents) {
      events[event] = true;
    }

    return events;
  }, [attendedEvents]);
  const eventOptions = React.useMemo(
    () =>
      eventArray.map((event) => ({
        id: event._id,
        title: event.title,
        subtitle: moment(event.start).format('ddd LLL')
      })),
    [eventArray]
  );

  const onChangeEmail = React.useCallback((text: string) => {
    setEmail(text);
  }, []);

  const onChangePhone = React.useCallback((text: string) => {
    setPhone(text);
  }, []);

  const onChangeGivenName = React.useCallback((text: string) => {
    setGivenName(text);
  }, []);

  const onChangeFamilyName = React.useCallback((text: string) => {
    setFamilyName(text);
  }, []);

  const onChangeMajor = React.useCallback((text: string) => {
    setMajor(text);
  }, []);

  const onChangeClassYear = React.useCallback((chosen: TCandidate['classYear']) => {
    setClassYear(chosen);
  }, []);

  const onChangeSecondTimeRush = React.useCallback((newValue: boolean) => {
    setSecondTimeRush(newValue);
  }, []);

  const onChangeEvents = React.useCallback(
    (eventId: string) => {
      const newAttendedEvents = [];

      for (const event of eventArray) {
        if (
          (event._id !== eventId && selectedEvents[event._id] === true) ||
          (event._id === eventId && selectedEvents[event._id] !== true)
        ) {
          newAttendedEvents.push(event._id);
        }
      }

      setAttendedEvents(newAttendedEvents);
    },
    [eventArray, selectedEvents]
  );

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isSavingCandidate} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Add Multiple Candidates</Text>
          {selectedCandidate !== null && (
            <Text style={styles.subtitleText}>
              {selectedCandidate.givenName} {selectedCandidate.familyName}
            </Text>
          )}
        </View>

        <View style={styles.saveWrapper}>
          {isSavingCandidate ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSave ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSave}
              onPress={saveCandidates}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>{renderHeader()}</View>

      <View style={styles.content}>
        <Text>PLEASE VERIFY THAT THE .CSV IS IN THE CORRECT FORMAT</Text>
        {emailIsDuplicate && <Text>Duplicate Emails in List</Text>}
        <form id="csv-form">
          <input
            type="file"
            accept=".csv"
            id="csvFile"
            onChange={(e) => {
              setCsvFile(e.target.files[0]);
            }}
          ></input>
          <br />
          <button
            onClick={(e) => {
              e.preventDefault();
              if (csvFile) submit();
            }}
          >
            Submit
          </button>
          <br />
          <br />
          {csvArray.length > 0 ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Class Year</th>
                    <th>Major</th>
                    <th>Second Time Rush?</th>
                  </tr>
                </thead>
                <tbody>
                  {csvArray.map((item, i) => (
                    <tr key={i}>
                      <td>{item.firstname}</td>
                      <td>{item.lastname}</td>
                      <td>{item.email}</td>
                      <td>{item.classyear}</td>
                      <td>{item.major}</td>
                      <td>{item.secondtimerush}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </form>
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
    minHeight: 640,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8
  },
  section: {
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
  },
  dividerIcon: {
    marginVertical: 8
  }
});

export default EditMultCandidatePage;
