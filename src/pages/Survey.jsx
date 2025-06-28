import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveStudentData } from '../services/firebaseService';
import './Survey.css';

function Survey() {
  const location = useLocation();
  const navigate = useNavigate();
  const [surveyAnswers, setSurveyAnswers] = useState({
    fluency: 0,
    pronunciation: 0,
    vocabulary: 0,
    grammar: 0,
    comprehension: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: 'fluency',
      question: 'How fluent is the student in conversation?',
      description: 'Consider the student\'s ability to speak without long pauses or hesitation'
    },
    {
      id: 'pronunciation',
      question: 'How clear is the student\'s pronunciation?',
      description: 'Evaluate how easily the student can be understood by native speakers'
    },
    {
      id: 'vocabulary',
      question: 'How extensive is the student\'s vocabulary?',
      description: 'Assess the range and appropriateness of words used in conversation'
    },
    {
      id: 'grammar',
      question: 'How accurate is the student\'s grammar?',
      description: 'Consider the correctness of sentence structure and verb tenses'
    },
    {
      id: 'comprehension',
      question: 'How well does the student understand spoken English?',
      description: 'Evaluate the student\'s ability to follow and respond to conversation'
    }
  ];

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  const handleRatingChange = (questionId, rating) => {
    setSurveyAnswers(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  const calculateAverage = () => {
    const values = Object.values(surveyAnswers);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return values.every(val => val > 0) ? (sum / values.length).toFixed(1) : 0;
  };

  const getLevelRecommendation = (average) => {
    if (average >= 4.5) return 'Advanced';
    if (average >= 3.5) return 'Upper Intermediate';
    if (average >= 2.5) return 'Intermediate';
    if (average >= 1.5) return 'Pre-Intermediate';
    return 'Beginner';
  };

  const submitSurvey = async () => {
    const average = calculateAverage();
    if (average === 0) {
      alert('Please complete all questions before submitting.');
      return;
    }

    console.log('submitSurvey called, average:', average);
    setIsSubmitting(true);

    try {
      const studentInfo = location.state?.studentInfo || {};
      const examResults = location.state?.examResults || {};
      
      console.log('Student info from location:', studentInfo);
      console.log('Exam results from location:', examResults);
      
      // Calculate speaking percentage from survey average
      const speakingPercentage = (average / 5) * 100;
      console.log('Calculated speaking percentage:', speakingPercentage);
      
      // Prepare student data for Firebase
      const studentData = {
        ...studentInfo,
        speakingPercentage: speakingPercentage,
        listeningPercentage: examResults.listeningPercentage || 0,
        writingPercentage: examResults.writingPercentage || 0,
        grammarPercentage: examResults.grammarPercentage || 0,
        reachedLevel: getLevelRecommendation(average),
        surveyResults: surveyAnswers,
        examResults: examResults
      };

      console.log('Prepared student data for Firebase:', studentData);

      // Save to Firebase
      console.log('About to call saveStudentData...');
      const result = await saveStudentData(studentData);
      console.log('saveStudentData result:', result);

      const surveyData = {
        answers: surveyAnswers,
        average: parseFloat(average),
        recommendation: getLevelRecommendation(average),
        studentInfo: studentInfo,
        examResults: examResults
      };

      console.log('Survey Results:', surveyData);
      
      alert(`Conversational evaluation completed! Average score: ${average}/5\nRecommended level: ${getLevelRecommendation(average)}\nData saved to database.\n\nNow proceeding to the written exam.`);
      
      // Navigate to exam with student info and survey results
      navigate('/exam', { 
        state: { 
          studentInfo: studentInfo,
          surveyResults: surveyData
        } 
      });
    } catch (error) {
      console.error('Error in submitSurvey:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="survey-container">
      <div className="survey-content">
        <div className="survey-header">
          <h1>Conversational Skills Evaluation</h1>
          <h2>Atención: este campo es para el diligenciamiento exclusivo por parte del instructor</h2>
          <p>Please evaluate the student's conversational abilities based on your interaction</p>
        </div>

        <div className="survey-questions">
          {questions.map((q) => (
            <div key={q.id} className="question-card">
              <h3 className="question-title">{q.question}</h3>
              <p className="question-description">{q.description}</p>
              
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-button ${surveyAnswers[q.id] === rating ? 'selected' : ''}`}
                    onClick={() => handleRatingChange(q.id, rating)}
                  >
                    <span className="rating-number">{rating}</span>
                    <span className="rating-label">{ratingLabels[rating]}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="survey-summary">
            <div className="average-score">
              <h3>Average Score: {calculateAverage()}/5</h3>
              {calculateAverage() > 0 && (
                <p className="recommendation">
                  Recommended Level: <strong>{getLevelRecommendation(calculateAverage())}</strong>
                </p>
              )}
            </div>
            
            <div className="survey-buttons">
              <button 
                className="submit-button"
                onClick={submitSurvey}
                disabled={calculateAverage() === 0 || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Submit Evaluation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Survey;
