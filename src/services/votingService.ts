import moment from 'moment';

import { TCandidateDict, TCandidate, TSession, TSessionToCandidateToVoteDict, TVote } from '@backend/voting';
import { TDirectory } from '@backend/kappa';
import { sortUserByName } from '@services/kappaService';

export const TYPE_OPTIONS = [
  { id: 'REGULAR', title: 'One at a time' },
  { id: 'MULTI', title: 'Multiple choice' }
];

export const CLASS_YEAR_OPTIONS = [
  { id: 'FR', title: 'Freshman' },
  { id: 'SO', title: 'Sophomore' },
  { id: 'JR', title: 'Junior' },
  { id: 'SR', title: 'Senior' }
];

export const separateByCandidateEmail = (candidates: TCandidate[]): TCandidateDict => {
  const separated = {};

  for (const candidate of candidates) {
    separated[candidate.email] = candidate;
  }

  return separated;
};

export const separateByCandidateId = (candidates: TCandidate[]): TCandidateDict => {
  const separated = {};

  for (const candidate of candidates) {
    separated[candidate._id] = candidate;
  }

  return separated;
};

export const mergeCandidates = (emailToCandidate: TCandidateDict, newCandidates: TCandidate[]): TCandidateDict => {
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
  if (newVotes.length === 0) {
    return sessionToCandidateToVotes;
  }

  const mergedVotes = sessionToCandidateToVotes;

  const sessionId = newVotes[0].sessionId;
  const candidateId = newVotes[0].candidateId;
  const votes: {
    [_id: string]: TVote;
  } = {};

  if (!mergedVotes.hasOwnProperty(sessionId)) {
    mergedVotes[sessionId] = {};
  }

  if (!mergedVotes[sessionId].hasOwnProperty(candidateId)) {
    mergedVotes[sessionId][candidateId] = [];
  }

  for (const vote of mergedVotes[sessionId][candidateId]) {
    votes[vote._id] = vote;
  }

  for (const vote of newVotes) {
    votes[vote._id] = vote;
  }

  mergedVotes[sessionId][candidateId] = Object.values(votes);

  return mergedVotes;
};

export const getVotes = (
  sessionToCandidateToVotes: TSessionToCandidateToVoteDict,
  sessionId: string,
  candidateId: string,
  directory: TDirectory
): (TVote & { userName: string })[] => {
  if (
    !sessionToCandidateToVotes.hasOwnProperty(sessionId) ||
    !sessionToCandidateToVotes[sessionId].hasOwnProperty(candidateId)
  ) {
    return [];
  }

  return sessionToCandidateToVotes[sessionId][candidateId].map((vote) => {
    const user = directory[vote.userEmail];
    return {
      ...vote,
      userName: user ? `${user.familyName}, ${user.givenName}` : vote.userEmail
    };
  });
};

export const getVotesBySession = (
  sessionToCandidateToVotes: TSessionToCandidateToVoteDict,
  sessionId: string
): {
  [candidateId: string]: TVote[];
} => {
  if (!sessionToCandidateToVotes.hasOwnProperty(sessionId)) {
    return {};
  }

  return sessionToCandidateToVotes[sessionId];
};

export const recomputeVotingState = ({ emailToCandidate }: { emailToCandidate: TCandidateDict }) => {
  const candidateArray = Object.values(emailToCandidate).sort(sortUserByName);
  const idToCandidate = separateByCandidateId(candidateArray);
  const approvedCandidateArray = candidateArray.filter((candidate) => candidate.approved);
  const unapprovedCandidateArray = candidateArray.filter((candidate) => !candidate.approved);

  return {
    emailToCandidate,
    idToCandidate,
    candidateArray,
    approvedCandidateArray,
    unapprovedCandidateArray
  };
};
