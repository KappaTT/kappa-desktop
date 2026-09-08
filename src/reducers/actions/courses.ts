import { Courses } from '@backend';
import { TUser } from '@backend/auth';
import { TAdvice } from '@backend/courses';
import {
  GET_COURSES,
  GET_COURSES_SUCCESS,
  GET_COURSES_FAILURE,
  ENROLL_COURSE,
  ENROLL_COURSE_SUCCESS,
  ENROLL_COURSE_FAILURE,
  UNENROLL_COURSE,
  UNENROLL_COURSE_SUCCESS,
  UNENROLL_COURSE_FAILURE,
  SEARCH_COURSES,
  SEARCH_COURSES_SUCCESS,
  SEARCH_COURSES_FAILURE,
  APPROVE_COURSE,
  APPROVE_COURSE_SUCCESS,
  APPROVE_COURSE_FAILURE,
  REJECT_COURSE,
  REJECT_COURSE_SUCCESS,
  REJECT_COURSE_FAILURE,
  DELETE_COURSE,
  DELETE_COURSE_SUCCESS,
  DELETE_COURSE_FAILURE,
  GET_COURSE_ADVICE,
  GET_COURSE_ADVICE_SUCCESS,
  GET_COURSE_ADVICE_FAILURE,
  SAVE_ADVICE,
  SAVE_ADVICE_SUCCESS,
  SAVE_ADVICE_FAILURE,
  DELETE_ADVICE,
  DELETE_ADVICE_SUCCESS,
  DELETE_ADVICE_FAILURE,
  SHOW_ADD_COURSE,
  HIDE_ADD_COURSE,
  EDIT_ADVICE,
  CANCEL_EDIT_ADVICE
} from '@reducers/courses';

/**
 * Is getting the list of courses.
 */
const gettingCourses = () => {
  return {
    type: GET_COURSES
  };
};

/**
 * Finished getting the courses successfully.
 */
const getCoursesSuccess = (data) => {
  return {
    type: GET_COURSES_SUCCESS,
    courses: data.courses
  };
};

/**
 * Finished getting the courses with an error.
 */
const getCoursesFailure = (error) => {
  return {
    type: GET_COURSES_FAILURE,
    error
  };
};

/**
 * Get the list of courses with enrollments.
 */
export const getCourses = (user: TUser) => {
  return (dispatch) => {
    dispatch(gettingCourses());

    Courses.getCourses({ user }).then((res) => {
      if (res.success) {
        dispatch(getCoursesSuccess(res.data));
      } else {
        dispatch(getCoursesFailure(res.error));
      }
    });
  };
};

/**
 * Is enrolling in a course.
 */
const enrolling = () => {
  return {
    type: ENROLL_COURSE
  };
};

/**
 * Finished enrolling successfully.
 */
const enrollSuccess = (data) => {
  return {
    type: ENROLL_COURSE_SUCCESS,
    course: data.course,
    enrollment: data.enrollment
  };
};

/**
 * Finished enrolling with an error.
 */
const enrollFailure = (error) => {
  return {
    type: ENROLL_COURSE_FAILURE,
    error
  };
};

/**
 * Enroll the current user in a course, either by the id of an existing course or by course code.
 * Codes must match the official catalog unless the course is explicitly requested as new.
 */
export const enroll = (
  user: TUser,
  enrollment: {
    courseId?: string;
    courseCode?: string;
    courseTitle?: string;
    requestNew?: boolean;
    term: string;
  }
) => {
  return (dispatch) => {
    dispatch(enrolling());

    Courses.enroll({ user, ...enrollment }).then((res) => {
      if (res.success) {
        dispatch(enrollSuccess(res.data));
      } else {
        dispatch(enrollFailure(res.error));
      }
    });
  };
};

/**
 * Is dropping a course.
 */
const unenrolling = (enrollmentId: string) => {
  return {
    type: UNENROLL_COURSE,
    enrollmentId
  };
};

/**
 * Finished dropping successfully.
 */
const unenrollSuccess = (data, courseId: string) => {
  return {
    type: UNENROLL_COURSE_SUCCESS,
    enrollment: data.enrollment,
    courseId
  };
};

/**
 * Finished dropping with an error.
 */
const unenrollFailure = (error) => {
  return {
    type: UNENROLL_COURSE_FAILURE,
    error
  };
};

/**
 * Drop a class by deleting the given enrollment.
 */
export const unenroll = (user: TUser, enrollmentId: string, courseId: string) => {
  return (dispatch) => {
    dispatch(unenrolling(enrollmentId));

    Courses.deleteEnrollment({ user, _id: enrollmentId }).then((res) => {
      if (res.success) {
        dispatch(unenrollSuccess(res.data, courseId));
      } else {
        dispatch(unenrollFailure(res.error));
      }
    });
  };
};

/**
 * Is searching the official course catalog.
 */
const searchingCourses = () => {
  return {
    type: SEARCH_COURSES
  };
};

/**
 * Finished searching the catalog successfully.
 */
const searchCoursesSuccess = (data) => {
  return {
    type: SEARCH_COURSES_SUCCESS,
    courses: data.courses
  };
};

/**
 * Finished searching the catalog with an error.
 */
const searchCoursesFailure = (error) => {
  return {
    type: SEARCH_COURSES_FAILURE,
    error
  };
};

/**
 * Search the official university course catalog by course code or title.
 */
export const searchCourses = (user: TUser, query: string) => {
  return (dispatch) => {
    dispatch(searchingCourses());

    Courses.searchOfficialCourses({ user, query }).then((res) => {
      if (res.success) {
        dispatch(searchCoursesSuccess(res.data));
      } else {
        dispatch(searchCoursesFailure(res.error));
      }
    });
  };
};

/**
 * Is approving a requested course.
 */
const approvingCourse = () => {
  return {
    type: APPROVE_COURSE
  };
};

/**
 * Finished approving the course successfully.
 */
const approveCourseSuccess = (data) => {
  return {
    type: APPROVE_COURSE_SUCCESS,
    course: data.course
  };
};

/**
 * Finished approving the course with an error.
 */
const approveCourseFailure = (error) => {
  return {
    type: APPROVE_COURSE_FAILURE,
    error
  };
};

/**
 * Approve a requested course (privileged only).
 */
export const approveCourse = (user: TUser, courseId: string) => {
  return (dispatch) => {
    dispatch(approvingCourse());

    Courses.approveCourse({ user, _id: courseId }).then((res) => {
      if (res.success) {
        dispatch(approveCourseSuccess(res.data));
      } else {
        dispatch(approveCourseFailure(res.error));
      }
    });
  };
};

/**
 * Is rejecting a pending course.
 */
const rejectingCourse = () => {
  return {
    type: REJECT_COURSE
  };
};

/**
 * Finished rejecting the course successfully.
 */
const rejectCourseSuccess = (data) => {
  return {
    type: REJECT_COURSE_SUCCESS,
    courseId: data.course._id
  };
};

/**
 * Finished rejecting the course with an error.
 */
const rejectCourseFailure = (error) => {
  return {
    type: REJECT_COURSE_FAILURE,
    error
  };
};

/**
 * Reject a pending course along with its enrollments and advice (privileged only).
 */
export const rejectCourse = (user: TUser, courseId: string) => {
  return (dispatch) => {
    dispatch(rejectingCourse());

    Courses.rejectCourse({ user, _id: courseId }).then((res) => {
      if (res.success) {
        dispatch(rejectCourseSuccess(res.data));
      } else {
        dispatch(rejectCourseFailure(res.error));
      }
    });
  };
};

/**
 * Is deleting a course.
 */
const deletingCourse = () => {
  return {
    type: DELETE_COURSE
  };
};

/**
 * Finished deleting the course successfully.
 */
const deleteCourseSuccess = (data) => {
  return {
    type: DELETE_COURSE_SUCCESS,
    courseId: data.course._id
  };
};

/**
 * Finished deleting the course with an error.
 */
const deleteCourseFailure = (error) => {
  return {
    type: DELETE_COURSE_FAILURE,
    error
  };
};

/**
 * Delete a course along with its enrollments and advice (privileged only).
 */
export const deleteCourse = (user: TUser, courseId: string) => {
  return (dispatch) => {
    dispatch(deletingCourse());

    Courses.deleteCourse({ user, _id: courseId }).then((res) => {
      if (res.success) {
        dispatch(deleteCourseSuccess(res.data));
      } else {
        dispatch(deleteCourseFailure(res.error));
      }
    });
  };
};

/**
 * Is getting the advice for a course.
 */
const gettingCourseAdvice = () => {
  return {
    type: GET_COURSE_ADVICE
  };
};

/**
 * Finished getting the advice successfully.
 */
const getCourseAdviceSuccess = (data, courseId: string) => {
  return {
    type: GET_COURSE_ADVICE_SUCCESS,
    advice: data.advice,
    courseId
  };
};

/**
 * Finished getting the advice with an error.
 */
const getCourseAdviceFailure = (error) => {
  return {
    type: GET_COURSE_ADVICE_FAILURE,
    error
  };
};

/**
 * Get the advice for a given course.
 */
export const getCourseAdvice = (user: TUser, courseId: string) => {
  return (dispatch) => {
    dispatch(gettingCourseAdvice());

    Courses.getCourseAdvice({ user, courseId }).then((res) => {
      if (res.success) {
        dispatch(getCourseAdviceSuccess(res.data, courseId));
      } else {
        dispatch(getCourseAdviceFailure(res.error));
      }
    });
  };
};

/**
 * Is saving a piece of advice.
 */
const savingAdvice = () => {
  return {
    type: SAVE_ADVICE
  };
};

/**
 * Finished saving advice successfully.
 */
const saveAdviceSuccess = (data) => {
  return {
    type: SAVE_ADVICE_SUCCESS,
    advice: data.advice
  };
};

/**
 * Finished saving advice with an error.
 */
const saveAdviceFailure = (error) => {
  return {
    type: SAVE_ADVICE_FAILURE,
    error
  };
};

/**
 * Save a piece of advice by id if one exists, create one otherwise.
 */
export const saveAdvice = (user: TUser, advice: Partial<TAdvice>, adviceId?: string) => {
  return (dispatch) => {
    dispatch(savingAdvice());

    if (adviceId && adviceId !== 'NEW') {
      Courses.updateAdvice({ user, _id: adviceId, changes: advice }).then((res) => {
        if (res.success) {
          dispatch(saveAdviceSuccess(res.data));
        } else {
          dispatch(saveAdviceFailure(res.error));
        }
      });
    } else {
      Courses.createAdvice({ user, advice }).then((res) => {
        if (res.success) {
          dispatch(saveAdviceSuccess(res.data));
        } else {
          dispatch(saveAdviceFailure(res.error));
        }
      });
    }
  };
};

/**
 * Is deleting a piece of advice.
 */
const deletingAdvice = () => {
  return {
    type: DELETE_ADVICE
  };
};

/**
 * Finished deleting advice successfully.
 */
const deleteAdviceSuccess = (data, courseId: string) => {
  return {
    type: DELETE_ADVICE_SUCCESS,
    advice: data.advice,
    courseId
  };
};

/**
 * Finished deleting advice with an error.
 */
const deleteAdviceFailure = (error) => {
  return {
    type: DELETE_ADVICE_FAILURE,
    error
  };
};

/**
 * Delete a given piece of advice.
 */
export const deleteAdvice = (user: TUser, courseId: string, adviceId: string) => {
  return (dispatch) => {
    dispatch(deletingAdvice());

    Courses.deleteAdvice({ user, _id: adviceId }).then((res) => {
      if (res.success) {
        dispatch(deleteAdviceSuccess(res.data, courseId));
      } else {
        dispatch(deleteAdviceFailure(res.error));
      }
    });
  };
};

/**
 * Show the add course page.
 */
export const showAddCourse = () => {
  return {
    type: SHOW_ADD_COURSE
  };
};

/**
 * Hide the add course page.
 */
export const hideAddCourse = () => {
  return {
    type: HIDE_ADD_COURSE
  };
};

/**
 * Edit a given piece of advice or create a new one for the given course.
 */
export const editAdvice = (courseId: string, adviceId: string = 'NEW') => {
  return {
    type: EDIT_ADVICE,
    courseId,
    adviceId
  };
};

/**
 * Close the advice editor.
 */
export const cancelEditAdvice = () => {
  return {
    type: CANCEL_EDIT_ADVICE
  };
};
