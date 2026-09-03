import type { Survey, Question } from '../types/survey';
import {
  studyHabitSurvey,
  studyHabitQuestions,
  campusEnvironmentSurvey,
  STUDY_HABIT_SURVEY_ID,
  CAMPUS_SURVEY_ID,
} from '../data/studyHabitSurvey';

export { STUDY_HABIT_SURVEY_ID, CAMPUS_SURVEY_ID };

export const defaultSurveys: Survey[] = [
  studyHabitSurvey,
  campusEnvironmentSurvey,
];

export const defaultQuestions: Question[] = [
  ...studyHabitQuestions,
  // Sample questions for campus environment survey to prove multi-survey platform capability
  {
    id: 'ce-q1',
    surveyId: CAMPUS_SURVEY_ID,
    order: 1,
    step: 1,
    title: 'Khu vực tự học bạn thường sử dụng nhất trên khuôn viên?',
    label: 'Khu vực tự học',
    type: 'singleChoice',
    required: true,
    options: ['Tầng 1 Thư viện', 'Tầng 2 & 3 Thư viện (Khu yên tĩnh)', 'Sảnh tự học nhà A', 'Hành lang khu V', 'Khu vườn cà phê sinh viên'],
  },
  {
    id: 'ce-q2',
    surveyId: CAMPUS_SURVEY_ID,
    order: 2,
    step: 1,
    title: 'Đánh giá chất lượng đường truyền Wi-Fi tại khu vực tự học (1–5 Sao)',
    label: 'Tốc độ Wi-Fi',
    type: 'rating',
    required: true,
    min: 1,
    max: 5,
  },
  {
    id: 'ce-q3',
    surveyId: CAMPUS_SURVEY_ID,
    order: 3,
    step: 1,
    title: 'Khu vực có đủ ổ cắm điện cho laptop và thiết bị không?',
    label: 'Ổ cắm điện',
    type: 'yesNo',
    required: true,
  },
];
