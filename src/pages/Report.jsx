import React from 'react';
import { useLocation } from 'react-router-dom';

function Report() {
  const location = useLocation();
  const { answers, studentInfo } = location.state;

  const calculateScore = () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === index) correctAnswers++;
    });
    return correctAnswers;
  };

  const score = calculateScore();

  return (
    <div>
      <h1>Report</h1>
      <p>Student Name: {studentInfo.name}</p>
      <p>Document ID: {studentInfo.documentId}</p>
      <p>Score: {score}</p>
    </div>
  );
}

export default Report;