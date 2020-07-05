import { TCandidateDict, TCandidate } from '@backend/voting';

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

export const recomputeVotingState = ({ emailToCandidate }: { emailToCandidate: TCandidateDict }) => {
  const candidateArray = Object.values(emailToCandidate);

  return {
    emailToCandidate,
    candidateArray
  };
};
