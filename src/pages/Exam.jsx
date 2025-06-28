import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveStudentData, calculatePercentages, calculateReachedLevel } from '../services/firebaseService';
import './Exam.css';

function Exam() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExamDisqualified, setIsExamDisqualified] = useState(false);

  const questions = [
    { id: 1, question: 'What is your name?', options: ['Option 1', 'Option 2'], correct: 0 },
    { id: 2, question: 'What is your age?', options: ['Option 1', 'Option 2'], correct: 1 },
  ];

  // Prevent right-click
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Detect window/tab switching
  useEffect(() => {
    let hidden, visibilityChange;
    
    if (typeof document.hidden !== "undefined") {
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    const handleVisibilityChange = () => {
      if (document[hidden]) {
        // Student switched to another window/tab
        setIsExamDisqualified(true);
        alert('You have been disqualified for switching to another window/tab. Your exam will be submitted with a score of 0.');
        finishExamWithZero();
      }
    };

    document.addEventListener(visibilityChange, handleVisibilityChange);
    return () => document.removeEventListener(visibilityChange, handleVisibilityChange);
  }, []);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      alert('Time is up!');
      finishExam();
    }
  }, [timer]);

  const finishExamWithZero = async () => {
    setIsSubmitting(true);
    
    try {
      const studentInfo = location.state?.studentInfo || {};
      const surveyResults = location.state?.surveyResults || {};
      
      // Submit with zero scores
      const studentData = {
        ...studentInfo,
        listeningPercentage: 0,
        writingPercentage: 0,
        grammarPercentage: 0,
        speakingPercentage: 0,
        reachedLevel: 'Disqualified',
        surveyResults: surveyResults.answers || {},
        examResults: { answers: [], percentages: { listeningPercentage: 0, writingPercentage: 0, grammarPercentage: 0 } },
        finalSurveyResults: surveyResults,
        disqualified: true,
        disqualificationReason: 'Switched to another window/tab during exam'
      };

      await saveStudentData(studentData);
      
      navigate('/', { 
        state: { 
          finalResults: {
            studentInfo: studentInfo,
            surveyResults: surveyResults,
            examResults: { answers: [], percentages: { listeningPercentage: 0, writingPercentage: 0, grammarPercentage: 0 } },
            reachedLevel: 'Disqualified',
            disqualified: true
          }
        } 
      });
    } catch (error) {
      console.error('Error saving disqualified exam data:', error);
      alert('Error saving exam results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (index) => {
    if (isExamDisqualified) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const finishExam = async () => {
    if (isExamDisqualified) return;
    
    setIsSubmitting(true);
    
    try {
      const studentInfo = location.state?.studentInfo || {};
      const surveyResults = location.state?.surveyResults || {};
      const examResults = location.state?.examResults || {};
      
      console.log('Student info:', studentInfo);
      console.log('Survey results:', surveyResults);
      console.log('Previous exam results:', examResults);
      
      // Calculate percentages from exam results
      const percentages = calculatePercentages({ answers });
      const reachedLevel = calculateReachedLevel(percentages);
      
      // Prepare student data for Firebase - combine survey and exam results
      const studentData = {
        ...studentInfo,
        listeningPercentage: percentages.listeningPercentage,
        writingPercentage: percentages.writingPercentage,
        grammarPercentage: percentages.grammarPercentage,
        speakingPercentage: surveyResults.average ? (surveyResults.average / 5) * 100 : 0,
        reachedLevel: reachedLevel,
        surveyResults: surveyResults.answers || {},
        examResults: { answers, percentages },
        finalSurveyResults: surveyResults
      };

      console.log('Final student data to save:', studentData);

      // Save to Firebase
      await saveStudentData(studentData);
      
      console.log('Exam completed and final data saved:', studentData);
      
      // Navigate back to home
      navigate('/', { 
        state: { 
          finalResults: {
            studentInfo: studentInfo,
            surveyResults: surveyResults,
            examResults: { answers, percentages },
            reachedLevel: reachedLevel
          }
        } 
      });
    } catch (error) {
      console.error('Error saving exam data:', error);
      alert('Error saving exam results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (isExamDisqualified) return;
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishExam();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (timer <= 60) return 'timer danger';
    if (timer <= 180) return 'timer warning';
    return 'timer';
  };

  // If exam is disqualified, show disqualified message
  if (isExamDisqualified) {
    return (
      <div className="exam-container">
        <div className="exam-content">
          <div className="exam-header">
            <h1 className="exam-title">Exam Disqualified</h1>
          </div>
          <div className="question-container">
            <p className="question-text">
              You have been disqualified for switching to another window/tab during the exam.
              Your exam will be submitted with a score of 0.
            </p>
            <p>Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-container">
      <div className="exam-content">
        <div className="exam-header">
          <h1 className="exam-title">English Placement Test</h1>
          <div className={getTimerClass()}>
            {formatTime(timer)}
          </div>
        </div>
        
        <div className="question-container">
          <p className="question-text">{questions[currentQuestion].question}</p>
          <div className="options-container">
            {questions[currentQuestion].options.map((option, index) => (
              <button 
                key={index} 
                className={`option-button ${answers[currentQuestion] === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(index)}
                disabled={isSubmitting}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="navigation-buttons">
            <span className="question-counter">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <button 
              className="next-button" 
              onClick={nextQuestion}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (currentQuestion < questions.length - 1 ? 'Next' : 'Finish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exam;