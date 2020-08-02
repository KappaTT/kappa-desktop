import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import { theme } from '@constants';
import { TCandidate } from '@backend/voting';
import Icon from '@components/Icon';

const Item = SortableElement(({ value }: { value: TCandidate }) => (
  <View style={styles.candidateItem}>
    <View>
      <Text style={styles.candidateName}>
        {value.familyName}, {value.givenName}
      </Text>
      <Text style={styles.candidateDetails}>
        {value.classYear} in {value.major}
      </Text>
    </View>

    <View style={styles.candidateHandle}>
      <Icon family="MaterialCommunityIcons" name="drag" size={20} color={theme.COLORS.DARK_GRAY} />
    </View>
  </View>
));

const Container = SortableContainer(({ children }) => <View>{children}</View>);

const CandidateReorder: React.FC<{
  richCandidateOrder: TCandidate[];
  onChangeOrder(newCandidateOrder: TCandidate[]): void;
}> = ({ richCandidateOrder, onChangeOrder }) => {
  const onSortEnd = React.useCallback(
    ({ oldIndex, newIndex }) => {
      onChangeOrder(arrayMove(richCandidateOrder, oldIndex, newIndex));
    },
    [onChangeOrder, richCandidateOrder]
  );

  return (
    <View>
      <Container onSortEnd={onSortEnd} lockAxis="y">
        {richCandidateOrder.map((candidate, index) => (
          <Item key={`candidate-${candidate._id}`} index={index} value={candidate} />
        ))}
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  candidateItem: {
    width: '100%',
    height: 48,
    backgroundColor: `${theme.COLORS.WHITE}DF`,
    borderBottomColor: theme.COLORS.LIGHT_GRAY,
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  candidateName: {
    fontFamily: 'OpenSans',
    fontSize: 15,
    color: theme.COLORS.BLACK
  },
  candidateDetails: {
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
  },
  candidateHandle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export default CandidateReorder;
