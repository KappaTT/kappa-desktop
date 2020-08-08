import moment from 'moment';

import { TCandidateDict, TCandidate, TSession, TSessionToCandidateToVoteDict, TVote } from '@backend/voting';
import { sortUserByName } from './kappaService';

export const CLASS_YEAR_OPTIONS = [
  { id: 'FR', title: 'Freshman' },
  { id: 'SO', title: 'Sophomore' },
  { id: 'JR', title: 'Junior' },
  { id: 'SR', title: 'Senior' }
];

export const separateByCandidateEmail = (candidates: TCandidate[]) => {
  const separated = {};

  for (const candidate of candidates) {
    separated[candidate.email] = candidate;
  }

  return separated;
};

export const mergeCandidates = (emailToCandidate: TCandidateDict, newCandidates: TCandidate[]) => {
  const merged = emailToCandidate;

  for (const candidate of newCandidates) {
    merged[candidate.email] = candidate;
  }

  return merged;
};

export const separateBySessionId = (
  sessions: TSession[]
): {
  [_id: string]: TSession;
} => {
  const separated = {};

  for (const session of sessions) {
    separated[session._id] = session;
  }

  return separated;
};

export const mergeSessions = (sessions: TSession[], newSessions: TSession[]): TSession[] => {
  const idToSession = separateBySessionId(sessions);

  for (const session of newSessions) {
    idToSession[session._id] = session;
  }

  return Object.values(idToSession).sort(sortSessionByDate);
};

export const sortSessionByDate = (a: { startDate: string }, b: { startDate: string }) =>
  moment(a.startDate).isBefore(moment(b.startDate)) ? -1 : 1;

export const mergeVotes = (sessionToCandidateToVotes: TSessionToCandidateToVoteDict, newVotes: TVote[]) => {
  const mergedVotes = sessionToCandidateToVotes;

  for (const vote of newVotes) {
    const sessionId = vote.sessionId;
    const candidateId = vote.candidateId;

    if (!mergedVotes.hasOwnProperty(sessionId)) {
      mergedVotes[sessionId] = {};
    }

    mergedVotes[sessionId][candidateId] = vote;
  }

  return mergedVotes;
};

export const recomputeVotingState = ({
  emailToCandidate,
  sessionToCandidateToVotes
}: {
  emailToCandidate: TCandidateDict;
  sessionToCandidateToVotes: TSessionToCandidateToVoteDict;
}) => {
  const candidateArray = Object.values(emailToCandidate).sort(sortUserByName);
  const approvedCandidateArray = candidateArray.filter((candidate) => candidate.approved);
  const unapprovedCandidateArray = candidateArray.filter((candidate) => !candidate.approved);

  return {
    emailToCandidate,
    candidateArray,
    approvedCandidateArray,
    unapprovedCandidateArray,
    sessionToCandidateToVotes
  };
};
