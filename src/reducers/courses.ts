import moment from 'moment';

import { setGlobalError } from '@services/kappaService';
import { TLoadHistory } from '@backend/kappa';
import { TCourse, TCourseAdviceDict, TOfficialCourse } from '@backend/courses';
import {
  sortCoursesByCode,
  sortAdviceByDate,
  mergeCourse,
  updateCourse,
  removeCourse,
  removeEnrollment,
  mergeAdvice
} from '@services/coursesService';

export const CLEAR_GLOBAL_ERROR_MESSAGE = 'CLEAR_GLOBAL_ERROR_MESSAGE';
export const GET_COURSES = 'GET_COURSES';
export const GET_COURSES_SUCCESS = 'GET_COURSES_SUCCESS';
export const GET_COURSES_FAILURE = 'GET_COURSES_FAILURE';
export const ENROLL_COURSE = 'ENROLL_COURSE';
export const ENROLL_COURSE_SUCCESS = 'ENROLL_COURSE_SUCCESS';
export const ENROLL_COURSE_FAILURE = 'ENROLL_COURSE_FAILURE';
export const UNENROLL_COURSE = 'UNENROLL_COURSE';
export const UNENROLL_COURSE_SUCCESS = 'UNENROLL_COURSE_SUCCESS';
export const UNENROLL_COURSE_FAILURE = 'UNENROLL_COURSE_FAILURE';
export const SEARCH_COURSES = 'SEARCH_COURSES';
export const SEARCH_COURSES_SUCCESS = 'SEARCH_COURSES_SUCCESS';
export const SEARCH_COURSES_FAILURE = 'SEARCH_COURSES_FAILURE';
export const APPROVE_COURSE = 'APPROVE_COURSE';
export const APPROVE_COURSE_SUCCESS = 'APPROVE_COURSE_SUCCESS';
export const APPROVE_COURSE_FAILURE = 'APPROVE_COURSE_FAILURE';
export const REJECT_COURSE = 'REJECT_COURSE';
export const REJECT_COURSE_SUCCESS = 'REJECT_COURSE_SUCCESS';
export const REJECT_COURSE_FAILURE = 'REJECT_COURSE_FAILURE';
export const DELETE_COURSE = 'DELETE_COURSE';
export const DELETE_COURSE_SUCCESS = 'DELETE_COURSE_SUCCESS';
export const DELETE_COURSE_FAILURE = 'DELETE_COURSE_FAILURE';

export const GET_COURSE_ADVICE = 'GET_COURSE_ADVICE';
export const GET_COURSE_ADVICE_SUCCESS = 'GET_COURSE_ADVICE_SUCCESS';
export const GET_COURSE_ADVICE_FAILURE = 'GET_COURSE_ADVICE_FAILURE';
export const SAVE_ADVICE = 'SAVE_ADVICE';
export const SAVE_ADVICE_SUCCESS = 'SAVE_ADVICE_SUCCESS';
export const SAVE_ADVICE_FAILURE = 'SAVE_ADVICE_FAILURE';
export const DELETE_ADVICE = 'DELETE_ADVICE';
export const DELETE_ADVICE_SUCCESS = 'DELETE_ADVICE_SUCCESS';
export const DELETE_ADVICE_FAILURE = 'DELETE_ADVICE_FAILURE';

export const SHOW_ADD_COURSE = 'SHOW_ADD_COURSE';
export const HIDE_ADD_COURSE = 'HIDE_ADD_COURSE';
export const EDIT_ADVICE = 'EDIT_ADVICE';
export const CANCEL_EDIT_ADVICE = 'CANCEL_EDIT_ADVICE';

export interface TCoursesState {
  globalErrorMessage: string;
  globalErrorCode: number;
  globalErrorDate: Date;

  isGettingCourses: boolean;
  getCoursesError: boolean;
  getCoursesErrorMessage: string;

  isEnrolling: boolean;
  enrollError: boolean;
  enrollErrorMessage: string;

  isUnenrolling: boolean;
  unenrollError: boolean;
  unenrollErrorMessage: string;

  isSearchingCourses: boolean;
  searchCoursesError: boolean;
  searchCoursesErrorMessage: string;

  isApprovingCourse: boolean;
  approveCourseError: boolean;
  approveCourseErrorMessage: string;

  isRejectingCourse: boolean;
  rejectCourseError: boolean;
  rejectCourseErrorMessage: string;

  isDeletingCourse: boolean;
  deleteCourseError: boolean;
  deleteCourseErrorMessage: string;

  isGettingAdvice: boolean;
  getAdviceError: boolean;
  getAdviceErrorMessage: string;

  isSavingAdvice: boolean;
  saveAdviceError: boolean;
  saveAdviceErrorMessage: string;

  isDeletingAdvice: boolean;
  deleteAdviceError: boolean;
  deleteAdviceErrorMessage: string;

  isAddingCourse: boolean;
  editingAdviceCourseId: string;
  editingAdviceId: string;

  loadHistory: TLoadHistory;
  courseArray: TCourse[];
  courseSearchResults: TOfficialCourse[];
  courseIdToAdvice: TCourseAdviceDict;
}

const initialState: TCoursesState = {
  globalErrorMessage: '',
  globalErrorCode: 0,
  globalErrorDate: null,

  isGettingCourses: false,
  getCoursesError: false,
  getCoursesErrorMessage: '',

  isEnrolling: false,
  enrollError: false,
  enrollErrorMessage: '',

  isUnenrolling: false,
  unenrollError: false,
  unenrollErrorMessage: '',

  isSearchingCourses: false,
  searchCoursesError: false,
  searchCoursesErrorMessage: '',

  isApprovingCourse: false,
  approveCourseError: false,
  approveCourseErrorMessage: '',

  isRejectingCourse: false,
  rejectCourseError: false,
  rejectCourseErrorMessage: '',

  isDeletingCourse: false,
  deleteCourseError: false,
  deleteCourseErrorMessage: '',

  isGettingAdvice: false,
  getAdviceError: false,
  getAdviceErrorMessage: '',

  isSavingAdvice: false,
  saveAdviceError: false,
  saveAdviceErrorMessage: '',

  isDeletingAdvice: false,
  deleteAdviceError: false,
  deleteAdviceErrorMessage: '',

  isAddingCourse: false,
  editingAdviceCourseId: '',
  editingAdviceId: '',

  loadHistory: {},
  courseArray: [],
  courseSearchResults: [],
  courseIdToAdvice: {}
};

export default (state = initialState, action: any): TCoursesState => {
  switch (action.type) {
    case CLEAR_GLOBAL_ERROR_MESSAGE:
      return {
        ...state,
        globalErrorMessage: '',
        globalErrorCode: 0,
        globalErrorDate: null
      };
    case GET_COURSES:
      return {
        ...state,
        isGettingCourses: true,
        getCoursesError: false,
        getCoursesErrorMessage: ''
      };
    case GET_COURSES_SUCCESS:
      return {
        ...state,
        isGettingCourses: false,
        loadHistory: {
          ...state.loadHistory,
          courses: moment()
        },
        courseArray: action.courses.slice().sort(sortCoursesByCode)
      };
    case GET_COURSES_FAILURE:
      return {
        ...state,
        isGettingCourses: false,
        getCoursesError: true,
        getCoursesErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case ENROLL_COURSE:
      return {
        ...state,
        isEnrolling: true,
        enrollError: false,
        enrollErrorMessage: ''
      };
    case ENROLL_COURSE_SUCCESS:
      return {
        ...state,
        isEnrolling: false,
        isAddingCourse: false,
        courseArray: mergeCourse(state.courseArray, action.course, action.enrollment)
      };
    case ENROLL_COURSE_FAILURE:
      return {
        ...state,
        isEnrolling: false,
        enrollError: true,
        enrollErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case UNENROLL_COURSE:
      return {
        ...state,
        isUnenrolling: true,
        unenrollError: false,
        unenrollErrorMessage: ''
      };
    case UNENROLL_COURSE_SUCCESS:
      return {
        ...state,
        isUnenrolling: false,
        courseArray: removeEnrollment(state.courseArray, action.courseId, action.enrollment._id)
      };
    case UNENROLL_COURSE_FAILURE:
      return {
        ...state,
        isUnenrolling: false,
        unenrollError: true,
        unenrollErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case SEARCH_COURSES:
      return {
        ...state,
        isSearchingCourses: true,
        searchCoursesError: false,
        searchCoursesErrorMessage: ''
      };
    case SEARCH_COURSES_SUCCESS:
      return {
        ...state,
        isSearchingCourses: false,
        courseSearchResults: action.courses
      };
    case SEARCH_COURSES_FAILURE:
      return {
        ...state,
        isSearchingCourses: false,
        searchCoursesError: true,
        searchCoursesErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case APPROVE_COURSE:
      return {
        ...state,
        isApprovingCourse: true,
        approveCourseError: false,
        approveCourseErrorMessage: ''
      };
    case APPROVE_COURSE_SUCCESS:
      return {
        ...state,
        isApprovingCourse: false,
        courseArray: updateCourse(state.courseArray, action.course)
      };
    case APPROVE_COURSE_FAILURE:
      return {
        ...state,
        isApprovingCourse: false,
        approveCourseError: true,
        approveCourseErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case REJECT_COURSE:
      return {
        ...state,
        isRejectingCourse: true,
        rejectCourseError: false,
        rejectCourseErrorMessage: ''
      };
    case REJECT_COURSE_SUCCESS: {
      const courseIdToAdvice = { ...state.courseIdToAdvice };
      delete courseIdToAdvice[action.courseId];

      return {
        ...state,
        isRejectingCourse: false,
        courseArray: removeCourse(state.courseArray, action.courseId),
        courseIdToAdvice
      };
    }
    case REJECT_COURSE_FAILURE:
      return {
        ...state,
        isRejectingCourse: false,
        rejectCourseError: true,
        rejectCourseErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case DELETE_COURSE:
      return {
        ...state,
        isDeletingCourse: true,
        deleteCourseError: false,
        deleteCourseErrorMessage: ''
      };
    case DELETE_COURSE_SUCCESS: {
      const courseIdToAdvice = { ...state.courseIdToAdvice };
      delete courseIdToAdvice[action.courseId];

      return {
        ...state,
        isDeletingCourse: false,
        courseArray: removeCourse(state.courseArray, action.courseId),
        courseIdToAdvice
      };
    }
    case DELETE_COURSE_FAILURE:
      return {
        ...state,
        isDeletingCourse: false,
        deleteCourseError: true,
        deleteCourseErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case GET_COURSE_ADVICE:
      return {
        ...state,
        isGettingAdvice: true,
        getAdviceError: false,
        getAdviceErrorMessage: ''
      };
    case GET_COURSE_ADVICE_SUCCESS:
      return {
        ...state,
        isGettingAdvice: false,
        loadHistory: {
          ...state.loadHistory,
          [`advice-${action.courseId}`]: moment()
        },
        courseIdToAdvice: {
          ...state.courseIdToAdvice,
          [action.courseId]: action.advice.slice().sort(sortAdviceByDate)
        }
      };
    case GET_COURSE_ADVICE_FAILURE:
      return {
        ...state,
        isGettingAdvice: false,
        getAdviceError: true,
        getAdviceErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case SAVE_ADVICE:
      return {
        ...state,
        isSavingAdvice: true,
        saveAdviceError: false,
        saveAdviceErrorMessage: ''
      };
    case SAVE_ADVICE_SUCCESS:
      return {
        ...state,
        isSavingAdvice: false,
        editingAdviceCourseId: '',
        editingAdviceId: '',
        courseIdToAdvice: {
          ...state.courseIdToAdvice,
          [action.advice.courseId]: mergeAdvice(state.courseIdToAdvice[action.advice.courseId], action.advice)
        }
      };
    case SAVE_ADVICE_FAILURE:
      return {
        ...state,
        isSavingAdvice: false,
        saveAdviceError: true,
        saveAdviceErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case DELETE_ADVICE:
      return {
        ...state,
        isDeletingAdvice: true,
        deleteAdviceError: false,
        deleteAdviceErrorMessage: ''
      };
    case DELETE_ADVICE_SUCCESS:
      return {
        ...state,
        isDeletingAdvice: false,
        courseIdToAdvice: {
          ...state.courseIdToAdvice,
          [action.courseId]: (state.courseIdToAdvice[action.courseId] || []).filter(
            (advice) => advice._id !== action.advice._id
          )
        }
      };
    case DELETE_ADVICE_FAILURE:
      return {
        ...state,
        isDeletingAdvice: false,
        deleteAdviceError: true,
        deleteAdviceErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case SHOW_ADD_COURSE:
      return {
        ...state,
        isAddingCourse: true,
        courseSearchResults: [],
        searchCoursesError: false,
        searchCoursesErrorMessage: ''
      };
    case HIDE_ADD_COURSE:
      return {
        ...state,
        isAddingCourse: false
      };
    case EDIT_ADVICE:
      return {
        ...state,
        editingAdviceCourseId: action.courseId,
        editingAdviceId: action.adviceId
      };
    case CANCEL_EDIT_ADVICE:
      return {
        ...state,
        editingAdviceCourseId: '',
        editingAdviceId: ''
      };
    default:
      return state;
  }
};
