import React from 'react';
import { QuestionRenderer } from './QuestionRenderer';
import type { QuestionRendererProps } from './QuestionRenderer';

export const DynamicQuestionField: React.FC<QuestionRendererProps> = (props) => {
  return <QuestionRenderer {...props} />;
};

export default DynamicQuestionField;
