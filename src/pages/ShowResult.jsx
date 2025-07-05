import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStudentData } from '../services/firebaseService';
import './ShowResult.css';

function ShowResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Check if we have data from navigation state
        if (location.state?.studentData) {
          setStudentData(location.state.studentData);
          setLoading(false);
          return;
        }

        // If not, try to get from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const documentType = urlParams.get('documentType');
        const documentId = urlParams.get('documentId');

        if (documentType && documentId) {
          const result = await getStudentData(documentType, documentId);
          if (result.success) {
            setStudentData(result.data);
          } else {
            setError('Student data not found');
          }
        } else {
          setError('Missing document information');
        }
      } catch (err) {
        console.error('Error loading student data:', err);
        setError('Error loading student data');
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [location.state]);

  const getOptionClass = (questionIndex, optionIndex) => {
    if (!studentData?.examQuestions || !studentData?.examAnswers) {
      return 'option-result';
    }

    const question = studentData.examQuestions[questionIndex];
    const userAnswer = studentData.examAnswers[questionIndex];
    const correctAnswer = question?.correct;

    if (optionIndex === correctAnswer) {
      return 'option-result correct';
    } else if (optionIndex === userAnswer && userAnswer !== correctAnswer) {
      return 'option-result incorrect';
    }
    return 'option-result';
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    if (percentage >= 40) return 'score-fair';
    return 'score-poor';
  };

  if (loading) {
    return (
      <div className="result-container">
        <div className="result-content">
          <h1>Loading Results...</h1>
          <p>Please wait while we load your exam results.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-container">
        <div className="result-content">
          <h1>Error</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="result-container">
        <div className="result-content">
          <h1>No Data Found</h1>
          <p>No exam results found for this student.</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="result-content">
        <div className="result-header">
          <h1>Exam Results</h1>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>

        {/* Student Information */}
        <div className="student-info">
          <h2>Student Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Name:</strong> {studentData.studentName}
            </div>
            <div className="info-item">
              <strong>Document Type:</strong> {studentData.documentType}
            </div>
            <div className="info-item">
              <strong>Document Number:</strong> {studentData.documentNumber}
            </div>
            <div className="info-item">
              <strong>Place of Expedition:</strong> {studentData.placeOfExpedition}
            </div>
            <div className="info-item">
              <strong>City:</strong> {studentData.city}
            </div>
            <div className="info-item">
              <strong>Reached Level:</strong> 
              <span className={`level-badge ${studentData.reachedLevel?.toLowerCase()}`}>
                {studentData.reachedLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Scores Summary */}
        <div className="scores-summary">
          <h2>Skills Assessment</h2>
          <div className="scores-grid">
            <div className="score-item">
              <span className="score-label">Listening</span>
              <span className={`score-value ${getScoreColor(studentData.listeningPercentage)}`}>
                {studentData.listeningPercentage}%
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">Writing</span>
              <span className={`score-value ${getScoreColor(studentData.writingPercentage)}`}>
                {studentData.writingPercentage}%
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">Grammar</span>
              <span className={`score-value ${getScoreColor(studentData.grammarPercentage)}`}>
                {studentData.grammarPercentage}%
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">Reading</span>
              <span className={`score-value ${getScoreColor(studentData.readingPercentage)}`}>
                {studentData.readingPercentage}%
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">Speaking</span>
              <span className={`score-value ${getScoreColor(studentData.speakingPercentage)}`}>
                {studentData.speakingPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Exam Questions and Answers */}
        {studentData.examQuestions && studentData.examQuestions.length > 0 && (
          <div className="exam-results">
            <h2>Exam Questions and Answers</h2>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color correct"></div>
                <span>Correct Answer</span>
              </div>
              <div className="legend-item">
                <div className="legend-color incorrect"></div>
                <span>Your Incorrect Answer</span>
              </div>
            </div>
            
            <div className="questions-container">
              {studentData.examQuestions.map((question, questionIndex) => (
                <div key={question.id || questionIndex} className="question-result">
                  <h3>Question {questionIndex + 1}</h3>
                  <p className="question-text">{question.question}</p>
                  
                  <div className="options-result">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex} 
                        className={getOptionClass(questionIndex, optionIndex)}
                      >
                        {option}
                        {optionIndex === question.correct && (
                          <span className="correct-indicator">✓ Correct</span>
                        )}
                        {optionIndex === studentData.examAnswers?.[questionIndex] && 
                         optionIndex !== question.correct && (
                          <span className="incorrect-indicator">✗ Your Answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Survey Results */}
        {studentData.surveyResults && Object.keys(studentData.surveyResults).length > 0 && (
          <div className="survey-results">
            <h2>Survey Results</h2>
            <div className="survey-grid">
              {Object.entries(studentData.surveyResults).map(([key, value]) => (
                <div key={key} className="survey-item">
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
        )}

        {studentData.disqualified && (
          <div className="disqualification-notice">
            <h2>Exam Disqualified</h2>
            <p>This exam was disqualified due to switching to another window/tab during the test.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowResult; 