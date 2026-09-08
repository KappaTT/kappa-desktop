import { TCourse, TEnrollment, TAdvice, TAdviceCategory } from '@backend/courses';

export const ADVICE_CATEGORIES: {
  id: TAdviceCategory;
  title: string;
}[] = [
  { id: 'PROFESSOR', title: 'Professor' },
  { id: 'EXAMS', title: 'Exams' },
  { id: 'ASSIGNMENTS', title: 'Assignments' },
  { id: 'GENERAL', title: 'General' }
];

export const getAdviceCategoryTitle = (category: TAdviceCategory) => {
  const found = ADVICE_CATEGORIES.find((adviceCategory) => adviceCategory.id === category);

  return found ? found.title : category;
};

/**
 * Normalize a course code the same way the backend does for suggestion matching.
 */
export const normalizeCourseCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * Get the current term based on the date, ex: "Fall 2026".
 */
export const getCurrentTerm = () => {
  const now = new Date();

  return `${now.getMonth() <= 5 ? 'Spring' : 'Fall'} ${now.getFullYear()}`;
};

/**
 * Get the numeric sort value for a term, ex: "Fall 2026" > "Spring 2026" > "Fall 2025".
 */
export const getTermValue = (term: string) => {
  const pieces = term.split(' ');

  if (pieces.length !== 2) {
    return 0;
  }

  const year = parseInt(pieces[1], 10);

  if (isNaN(year)) {
    return 0;
  }

  return year * 2 + (pieces[0] === 'Fall' ? 1 : 0);
};

/**
 * Get the term options for enrolling: every term from the current one back to Fall 2023.
 */
export const getTermOptions = () => {
  const options: { id: string; title: string }[] = [];

  const floor = getTermValue('Fall 2023');

  let [season, yearText] = getCurrentTerm().split(' ');
  let year = parseInt(yearText, 10);

  while (getTermValue(`${season} ${year}`) >= floor) {
    options.push({ id: `${season} ${year}`, title: `${season} ${year}` });

    if (season === 'Fall') {
      season = 'Spring';
    } else {
      season = 'Fall';
      year -= 1;
    }
  }

  // a device clock set before Fall 2023 would otherwise produce no options at all
  if (options.length === 0) {
    const currentTerm = getCurrentTerm();

    options.push({ id: currentTerm, title: currentTerm });
  }

  return options;
};

/**
 * Get the term options for advice: not specified, then every term from the current one back to Fall 2023.
 */
export const getAdviceTermOptions = () => {
  return [{ id: '', title: 'Not specified' }, ...getTermOptions()];
};

export const sortCoursesByCode = (a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code);

/**
 * Get the subject prefix of a course, ex: "CS 374" -> "CS".
 */
export const getCourseSubject = (course: { code: string; codeKey: string }) => {
  const match = course.codeKey.match(/^[A-Z]+/);

  return match ? match[0] : course.code.split(' ')[0] || course.code;
};

/**
 * Group courses by subject, subjects sorted alphabetically and courses sorted by code within each.
 */
export const groupCoursesBySubject = (courses: TCourse[]) => {
  const groups: {
    [subject: string]: TCourse[];
  } = {};

  for (const course of courses) {
    const subject = getCourseSubject(course);

    if (!groups.hasOwnProperty(subject)) {
      groups[subject] = [];
    }

    groups[subject].push(course);
  }

  return Object.keys(groups)
    .sort()
    .map((subject) => ({
      subject,
      courses: groups[subject].sort(sortCoursesByCode)
    }));
};

export const sortAdviceByDate = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt);

/**
 * Check if the given user is the web chair, the only role that can delete classes and moderate advice.
 */
export const isWebChair = (user: { role?: string; privileged?: boolean }) => {
  return user.privileged === true && user.role?.toLowerCase() === 'web';
};

/**
 * Check if the given user is enrolled in a course for the given term.
 */
export const getUserEnrollment = (course: TCourse, email: string, term: string) => {
  return (course.enrollments || []).find((enrollment) => enrollment.email === email && enrollment.term === term);
};

/**
 * Check if the given user is enrolled in a course for any term.
 */
export const hasUserEnrollment = (course: TCourse, email: string) => {
  return (course.enrollments || []).some((enrollment) => enrollment.email === email);
};

/**
 * Check if the given user is enrolled in a course for a term before the given one.
 */
export const hasPastUserEnrollment = (course: TCourse, email: string, currentTerm: string) => {
  return (course.enrollments || []).some(
    (enrollment) => enrollment.email === email && getTermValue(enrollment.term) < getTermValue(currentTerm)
  );
};

/**
 * Merge a course (and optionally a new enrollment) into the course array.
 */
export const mergeCourse = (courseArray: TCourse[], course: TCourse, enrollment?: TEnrollment) => {
  const existing = courseArray.find((candidate) => candidate._id === course._id);

  const enrollments = existing ? existing.enrollments || [] : course.enrollments || [];

  const mergedCourse: TCourse = {
    ...(existing || course),
    enrollments:
      enrollment && !enrollments.find((candidate) => candidate._id === enrollment._id)
        ? [...enrollments, enrollment]
        : enrollments
  };

  return [...courseArray.filter((candidate) => candidate._id !== course._id), mergedCourse].sort(sortCoursesByCode);
};

/**
 * Update the fields of the matching course in the course array, preserving its enrollments.
 */
export const updateCourse = (courseArray: TCourse[], course: TCourse) => {
  return courseArray.map((candidate) =>
    candidate._id === course._id
      ? {
          ...candidate,
          ...course,
          enrollments: candidate.enrollments || []
        }
      : candidate
  );
};

/**
 * Remove a course from the course array.
 */
export const removeCourse = (courseArray: TCourse[], courseId: string) => {
  return courseArray.filter((candidate) => candidate._id !== courseId);
};

/**
 * Remove an enrollment from the matching course in the course array.
 */
export const removeEnrollment = (courseArray: TCourse[], courseId: string, enrollmentId: string) => {
  return courseArray.map((course) =>
    course._id === courseId
      ? {
          ...course,
          enrollments: (course.enrollments || []).filter((enrollment) => enrollment._id !== enrollmentId)
        }
      : course
  );
};

/**
 * Group the enrollments of a course by term, sorted most recent term first.
 */
export const groupEnrollmentsByTerm = (enrollments: TEnrollment[]) => {
  const groups: {
    [term: string]: TEnrollment[];
  } = {};

  for (const enrollment of enrollments || []) {
    if (!groups.hasOwnProperty(enrollment.term)) {
      groups[enrollment.term] = [];
    }

    groups[enrollment.term].push(enrollment);
  }

  return Object.keys(groups)
    .sort((a, b) => getTermValue(b) - getTermValue(a))
    .map((term) => ({
      term,
      enrollments: groups[term]
    }));
};

/**
 * Replace or append a piece of advice in the advice list for its course.
 */
export const mergeAdvice = (adviceList: TAdvice[], advice: TAdvice) => {
  return [...(adviceList || []).filter((candidate) => candidate._id !== advice._id), advice].sort(sortAdviceByDate);
};
