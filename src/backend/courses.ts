import { ENDPOINTS, METHODS, TResponse, makeAuthorizedRequest, pass, fail } from '@backend/backend';
import { TUser } from '@backend/auth';
import { log } from '@services/logService';

export type TAdviceCategory = 'PROFESSOR' | 'EXAMS' | 'ASSIGNMENTS' | 'GENERAL';

export interface TEnrollment {
  _id: string;
  courseId: string;
  email: string;
  term: string;
  createdAt?: string;
}

export type TCourseSource = 'OFFICIAL' | 'REQUESTED';

export interface TCourse {
  _id: string;
  code: string;
  codeKey: string;
  title: string;
  source: TCourseSource;
  approved: boolean;
  createdBy: string;
  createdAt: string;
  enrollments: TEnrollment[];
}

export interface TOfficialCourse {
  _id: string;
  code: string;
  codeKey: string;
  subjectId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TAdvice {
  _id: string;
  courseId: string;
  email: string;
  anonymous: boolean;
  category: TAdviceCategory;
  professor: string;
  term?: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TCourseAdviceDict {
  [courseId: string]: TAdvice[];
}

export interface TGetCoursesPayload {
  user: TUser;
}

interface TGetCoursesRequestResponse {
  courses: TCourse[];
}

interface TGetCoursesResponse extends TResponse {
  data?: {
    courses: TCourse[];
  };
}

/**
 * Get the list of courses with their enrollments.
 */
export const getCourses = async (payload: TGetCoursesPayload): Promise<TGetCoursesResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetCoursesRequestResponse>(
      ENDPOINTS.GET_COURSES(),
      METHODS.GET_COURSES,
      {},
      payload.user.sessionToken
    );

    log('Get courses response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      courses: response.data.courses
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TSearchOfficialCoursesPayload {
  user: TUser;
  query: string;
}

interface TSearchOfficialCoursesRequestResponse {
  courses: TOfficialCourse[];
}

interface TSearchOfficialCoursesResponse extends TResponse {
  data?: {
    courses: TOfficialCourse[];
  };
}

/**
 * Search the official university course catalog by course code or title.
 */
export const searchOfficialCourses = async (
  payload: TSearchOfficialCoursesPayload
): Promise<TSearchOfficialCoursesResponse> => {
  try {
    const response = await makeAuthorizedRequest<TSearchOfficialCoursesRequestResponse>(
      ENDPOINTS.SEARCH_OFFICIAL_COURSES(),
      METHODS.SEARCH_OFFICIAL_COURSES,
      {
        queryParams: {
          q: payload.query
        }
      },
      payload.user.sessionToken
    );

    log('Search official courses response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      courses: response.data.courses
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TEnrollPayload {
  user: TUser;
  courseId?: string;
  courseCode?: string;
  courseTitle?: string;
  requestNew?: boolean;
  term: string;
}

interface TEnrollRequestResponse {
  course: TCourse;
  enrollment: TEnrollment;
}

interface TEnrollResponse extends TResponse {
  data?: TEnrollRequestResponse;
}

/**
 * Enroll the current user in a course, creating the course if it doesn't exist.
 */
export const enroll = async (payload: TEnrollPayload): Promise<TEnrollResponse> => {
  try {
    const response = await makeAuthorizedRequest<TEnrollRequestResponse>(
      ENDPOINTS.ENROLL_COURSE(),
      METHODS.ENROLL_COURSE,
      {
        body: {
          enrollment: {
            courseId: payload.courseId || '',
            courseCode: payload.courseCode || '',
            courseTitle: payload.courseTitle || '',
            requestNew: payload.requestNew || false,
            term: payload.term
          }
        }
      },
      payload.user.sessionToken
    );

    log('Enroll response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      course: response.data.course,
      enrollment: response.data.enrollment
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TApproveCoursePayload {
  user: TUser;
  _id: string;
}

interface TApproveCourseRequestResponse {
  course: TCourse;
}

interface TApproveCourseResponse extends TResponse {
  data?: TApproveCourseRequestResponse;
}

/**
 * Approve a requested course (privileged only). The returned course does not include enrollments.
 */
export const approveCourse = async (payload: TApproveCoursePayload): Promise<TApproveCourseResponse> => {
  try {
    const response = await makeAuthorizedRequest<TApproveCourseRequestResponse>(
      ENDPOINTS.APPROVE_COURSE({ _id: payload._id }),
      METHODS.APPROVE_COURSE,
      {},
      payload.user.sessionToken
    );

    log('Approve course response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      course: response.data.course
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TRejectCoursePayload {
  user: TUser;
  _id: string;
}

interface TRejectCourseRequestResponse {
  course: {
    _id: string;
  };
}

interface TRejectCourseResponse extends TResponse {
  data?: TRejectCourseRequestResponse;
}

/**
 * Reject a pending course along with its enrollments and advice (privileged only).
 */
export const rejectCourse = async (payload: TRejectCoursePayload): Promise<TRejectCourseResponse> => {
  try {
    const response = await makeAuthorizedRequest<TRejectCourseRequestResponse>(
      ENDPOINTS.REJECT_COURSE({ _id: payload._id }),
      METHODS.REJECT_COURSE,
      {},
      payload.user.sessionToken
    );

    log('Reject course response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      course: {
        _id: response.data.course._id
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TDeleteCoursePayload {
  user: TUser;
  _id: string;
}

interface TDeleteCourseRequestResponse {
  course: {
    _id: string;
  };
}

interface TDeleteCourseResponse extends TResponse {
  data?: TDeleteCourseRequestResponse;
}

/**
 * Delete a course along with its enrollments and advice (privileged only).
 */
export const deleteCourse = async (payload: TDeleteCoursePayload): Promise<TDeleteCourseResponse> => {
  try {
    const response = await makeAuthorizedRequest<TDeleteCourseRequestResponse>(
      ENDPOINTS.DELETE_COURSE({ _id: payload._id }),
      METHODS.DELETE_COURSE,
      {},
      payload.user.sessionToken
    );

    log('Delete course response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      course: {
        _id: response.data.course._id
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TDeleteEnrollmentPayload {
  user: TUser;
  _id: string;
}

interface TDeleteEnrollmentRequestResponse {
  enrollment: {
    _id: string;
  };
}

interface TDeleteEnrollmentResponse extends TResponse {
  data?: TDeleteEnrollmentRequestResponse;
}

/**
 * Delete a given enrollment (drop a class).
 */
export const deleteEnrollment = async (payload: TDeleteEnrollmentPayload): Promise<TDeleteEnrollmentResponse> => {
  try {
    const response = await makeAuthorizedRequest<TDeleteEnrollmentRequestResponse>(
      ENDPOINTS.DELETE_ENROLLMENT({ _id: payload._id }),
      METHODS.DELETE_ENROLLMENT,
      {},
      payload.user.sessionToken
    );

    log('Delete enrollment response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      enrollment: {
        _id: response.data.enrollment._id
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TGetCourseAdvicePayload {
  user: TUser;
  courseId: string;
}

interface TGetCourseAdviceRequestResponse {
  advice: TAdvice[];
}

interface TGetCourseAdviceResponse extends TResponse {
  data?: TGetCourseAdviceRequestResponse;
}

/**
 * Get the advice for a given course.
 */
export const getCourseAdvice = async (payload: TGetCourseAdvicePayload): Promise<TGetCourseAdviceResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetCourseAdviceRequestResponse>(
      ENDPOINTS.GET_COURSE_ADVICE({ courseId: payload.courseId }),
      METHODS.GET_COURSE_ADVICE,
      {},
      payload.user.sessionToken
    );

    log('Get course advice response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      advice: response.data.advice
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TCreateAdvicePayload {
  user: TUser;
  advice: Partial<TAdvice>;
}

interface TCreateAdviceRequestResponse {
  advice: TAdvice;
}

interface TCreateAdviceResponse extends TResponse {
  data?: TCreateAdviceRequestResponse;
}

/**
 * Create a new piece of advice for a course.
 */
export const createAdvice = async (payload: TCreateAdvicePayload): Promise<TCreateAdviceResponse> => {
  try {
    const response = await makeAuthorizedRequest<TCreateAdviceRequestResponse>(
      ENDPOINTS.CREATE_ADVICE(),
      METHODS.CREATE_ADVICE,
      {
        body: {
          advice: payload.advice
        }
      },
      payload.user.sessionToken
    );

    log('Create advice response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      advice: response.data.advice
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TUpdateAdvicePayload {
  user: TUser;
  _id: string;
  changes: Partial<TAdvice>;
}

interface TUpdateAdviceRequestResponse {
  advice: TAdvice;
}

interface TUpdateAdviceResponse extends TResponse {
  data?: TUpdateAdviceRequestResponse;
}

/**
 * Update an existing piece of advice.
 */
export const updateAdvice = async (payload: TUpdateAdvicePayload): Promise<TUpdateAdviceResponse> => {
  try {
    const response = await makeAuthorizedRequest<TUpdateAdviceRequestResponse>(
      ENDPOINTS.UPDATE_ADVICE({ _id: payload._id }),
      METHODS.UPDATE_ADVICE,
      {
        body: {
          changes: payload.changes
        }
      },
      payload.user.sessionToken
    );

    log('Update advice response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      advice: response.data.advice
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TDeleteAdvicePayload {
  user: TUser;
  _id: string;
}

interface TDeleteAdviceRequestResponse {
  advice: {
    _id: string;
  };
}

interface TDeleteAdviceResponse extends TResponse {
  data?: TDeleteAdviceRequestResponse;
}

/**
 * Delete a given piece of advice.
 */
export const deleteAdvice = async (payload: TDeleteAdvicePayload): Promise<TDeleteAdviceResponse> => {
  try {
    const response = await makeAuthorizedRequest<TDeleteAdviceRequestResponse>(
      ENDPOINTS.DELETE_ADVICE({ _id: payload._id }),
      METHODS.DELETE_ADVICE,
      {},
      payload.user.sessionToken
    );

    log('Delete advice response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      advice: {
        _id: response.data.advice._id
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};
