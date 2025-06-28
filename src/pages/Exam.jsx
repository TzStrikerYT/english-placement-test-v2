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

  const questions = `
  WwogICAgewogICAgICAiaWQiOiAxLAogICAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBlcyBsYSBmb3JtYSBjb3JyZWN0YSBkZWwgdmVyYm8gdG8gYmU/IiwKICAgICAgIm9wdGlvbnMiOiBbIkhlIGFyZSBoYXBweS4iLCAiU2hlIGlzIGEgc3R1ZGVudC4iLCAiSSBpcyB0aXJlZC4iLCAiVGhleSBhbSByZWFkeS4iXSwKICAgICAgImNvcnJlY3QiOiAxCiAgICB9LAogICAgewogICAgICAiaWQiOiAyLAogICAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBlcyBlbCBwbHVyYWwgZGUgY2hpbGQ/IiwKICAgICAgIm9wdGlvbnMiOiBbIkNoaWxkcyIsICJDaGlsZGVzIiwgIkNoaWxkcmVuIiwgIkNoaWxk4oCZcyJdLAogICAgICAiY29ycmVjdCI6IDIKICAgIH0sCiAgICB7CiAgICAgICJpZCI6IDMsCiAgICAgICJxdWVzdGlvbiI6ICLCv0N1w6FsIGVzIHVuIHN1c3RhbnRpdm8gbm8gY29udGFibGU/IiwKICAgICAgIm9wdGlvbnMiOiBbIkFwcGxlcyIsICJTdWdhciIsICJDaGFpcnMiLCAiQm9va3MiXSwKICAgICAgImNvcnJlY3QiOiAxCiAgICB9LAogICAgewogICAgICAiaWQiOiA0LAogICAgICAicXVlc3Rpb24iOiAiRWxpZ2UgbGEgb3JhY2nDs24gY29ycmVjdGE6IiwKICAgICAgIm9wdGlvbnMiOiBbIlRoZXJlIGlzIHR3byBkb2dzIGluIHRoZSBwYXJrLiIsICJUaGVyZSBhcmUgYSBjYXQgb24gdGhlIHNvZmEuIiwgIlRoZXJlIGFyZSBtYW55IHN0dWRlbnRzIGluIHRoZSBjbGFzcy4iLCAiVGhlcmUgaXMgdGhyZWUgcGVuY2lscyBvbiB0aGUgdGFibGUuIl0sCiAgICAgICJjb3JyZWN0IjogMgogICAgfSwKICAgIHsKICAgICAgImlkIjogNSwKICAgICAgInF1ZXN0aW9uIjogIsK/Q3XDoWwgb3BjacOzbiBlcyBjb3JyZWN0YSBwYXJhIGFsZ28gY2VyY2FubyB5IHNpbmd1bGFyPyIsCiAgICAgICJvcHRpb25zIjogWyJUaGlzIiwgIlRoYXQiLCAiVGhlc2UiLCAiVGhvc2UiXSwKICAgICAgImNvcnJlY3QiOiAwCiAgICB9LAogICAgewogICAgICAiaWQiOiA2LAogICAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCB2ZXJibyBtb2RhbCB1c2Ftb3MgcGFyYSBleHByZXNhciBoYWJpbGlkYWQ/IiwKICAgICAgIm9wdGlvbnMiOiBbIk11c3QiLCAiQ2FuIiwgIlNob3VsZCIsICJNaWdodCJdLAogICAgICAiY29ycmVjdCI6IDEKICAgIH0sCiAgICB7CiAgICAgICJpZCI6IDcsCiAgICAgICJxdWVzdGlvbiI6ICJFbGlnZSBsYSBvcmFjacOzbiBjb3JyZWN0YSBjb24gY29tcGFyYXRpdm86IiwKICAgICAgIm9wdGlvbnMiOiBbIk15IGNhciBpcyBmYXN0IHRoYW4geW91cnMuIiwgIk15IGhvdXNlIGlzIGJpZ2dlciB0aGFuIGhpcyBob3VzZS4iLCAiVGhpcyBib29rIGlzIHRoZSBtb3JlIGludGVyZXN0aW5nLiIsICJTaGUgaXMgbW9zdCB0YWxsIHRoYW4gbWUuIl0sCiAgICAgICJjb3JyZWN0IjogMQogICAgfSwKICAgIHsKICAgICAgImlkIjogOCwKICAgICAgInF1ZXN0aW9uIjogIkVsaWdlIGxhIG9yYWNpw7NuIGNvcnJlY3RhIGNvbiBzdXBlcmxhdGl2bzoiLAogICAgICAib3B0aW9ucyI6IFsiU2hlIGlzIHRoZSB0YWxsZXN0IGdpcmwgaW4gdGhlIGNsYXNzLiIsICJIZSBpcyBtb3N0IGZhc3QuIiwgIlRoaXMgaXMgdGhlIG1vcmUgZ29vZCBtb3ZpZS4iLCAiTXkgY2F0IGlzIHRoZSBiYWRkZXN0LiJdLAogICAgICAiY29ycmVjdCI6IDAKICAgIH0sCiAgICB7CiAgICAgICJpZCI6IDksCiAgICAgICJxdWVzdGlvbiI6ICJFbGlnZSBlbCBwbHVyYWwgY29ycmVjdG86IiwKICAgICAgIm9wdGlvbnMiOiBbIkJveHMiLCAiQm94aWVzIiwgIkJveGVzIiwgIkJveCJdLAogICAgICAiY29ycmVjdCI6IDIKICAgIH0sCiAgICB7CiAgICAgICJpZCI6IDEwLAogICAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBvcmFjacOzbiBlcyBjb3JyZWN0YT8iLAogICAgICAib3B0aW9ucyI6IFsiVGhlcmUgYXJlIHNvbWUgbWlsay4iLCAiVGhlcmUgaXMgYSBtaWxrLiIsICJUaGVyZSBpcyBzb21lIG1pbGsuIiwgIlRoZXJlIGFyZSB0d28gbWlsay4iXSwKICAgICAgImNvcnJlY3QiOiAyCiAgICB9LAogICAgewogICAgICAiaWQiOiAxMSwKICAgICAgInF1ZXN0aW9uIjogIsK/Q3XDoWwgb3BjacOzbiBlcyBjb3JyZWN0YT8iLAogICAgICAib3B0aW9ucyI6IFsiVGhvc2UgY2hhaXIgaXMgbmV3LiIsICJUaGlzIHBlbnMgYXJlIHJlZC4iLCAiVGhlc2UgYXBwbGVzIGFyZSBmcmVzaC4iLCAiVGhhdCBib29rcyBhcmUgb2xkLiJdLAogICAgICAiY29ycmVjdCI6IDIKICAgIH0sCiAgICB7CiAgICAgICJpZCI6IDEyLAogICAgICAicXVlc3Rpb24iOiAiwr9RdcOpIHByZXBvc2ljacOzbiBpbmRpY2EgbW92aW1pZW50byBoYWNpYSBhZGVudHJvPyIsCiAgICAgICJvcHRpb25zIjogWyJJbnRvIiwgIk9uIiwgIlVuZGVyIiwgIkJlaGluZCJdLAogICAgICAiY29ycmVjdCI6IDAKICAgIH0sCiAgICB7CiAgICAgICJpZCI6IDEzLAogICAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBXaC0gcXVlc3Rpb24gc2UgdXNhIHBhcmEgcHJlZ3VudGFyIHBvciBlbCBsdWdhcj8iLAogICAgICAib3B0aW9ucyI6IFsiV2hhdCIsICJXaGVyZSIsICJXaGVuIiwgIldobyJdLAogICAgICAiY29ycmVjdCI6IDEKICAgIH0sCiAgICB7CiAgICAgICJpZCI6IDE0LAogICAgICAicXVlc3Rpb24iOiAiRWxpZ2UgbGEgb3BjacOzbiBjb3JyZWN0YSBjb24gdGhlcmUgYXJlOiIsCiAgICAgICJvcHRpb25zIjogWyJUaGVyZSBhcmUgYW4gYXBwbGUuIiwgIlRoZXJlIGFyZSBtYW55IGNhcnMuIiwgIlRoZXJlIGFyZSBhIGRvZy4iLCAiVGhlcmUgYXJlIHN1Z2FyLiJdLAogICAgICAiY29ycmVjdCI6IDEKICAgIH0sCiAgICB7CiAgICAgICJpZCI6IDE1LAogICAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBvcmFjacOzbiB1c2Egc2hvdWxkIGNvcnJlY3RhbWVudGU/IiwKICAgICAgIm9wdGlvbnMiOiBbIllvdSBzaG91bGQgdG8gc3R1ZHkuIiwgIllvdSBzaG91bGQgc3R1ZGllcy4iLCAiWW91IHNob3VsZCBzdHVkeS4iLCAiWW91IHNob3VsZCBzdHVkeWluZy4iXSwKICAgICAgImNvcnJlY3QiOiAyCiAgICB9CiAgXQ==
  `;

  // Function to decode base64 and parse questions
  const decodeQuestions = (base64String) => {
    try {
      // Remove whitespace and newlines from the base64 string
      const cleanBase64 = base64String.trim().replace(/\s+/g, '');
      
      // Method 1: Try the standard approach first
      let decodedString;
      try {
        decodedString = decodeURIComponent(escape(atob(cleanBase64)));
      } catch (utf8Error) {
        // Method 2: If that fails, try direct atob and handle encoding manually
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        decodedString = new TextDecoder('utf-8').decode(bytes);
      }
      
      // Parse the JSON string to get the questions array
      const questionsArray = JSON.parse(decodedString);
      
      console.log('Decoded questions:', questionsArray);
      return questionsArray;
    } catch (error) {
      console.error('Error decoding questions:', error);
      // Return a fallback array if decoding fails
      return [
        { id: 1, question: 'Error loading questions', options: ['Error'], correct: 0 }
      ];
    }
  };

  // Decode the questions once when component mounts
  const [decodedQuestions, setDecodedQuestions] = useState([]);

  useEffect(() => {
    const questionsArray = decodeQuestions(questions);
    setDecodedQuestions(questionsArray);
  }, []);

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
    
    if (currentQuestion < decodedQuestions.length - 1) {
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

  // Show loading while questions are being decoded
  if (decodedQuestions.length === 0) {
    return (
      <div className="exam-container">
        <div className="exam-content">
          <div className="exam-header">
            <h1 className="exam-title">Loading Exam...</h1>
          </div>
          <div className="question-container">
            <p className="question-text">Please wait while the exam questions are being loaded...</p>
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
          <p className="question-text">{decodedQuestions[currentQuestion].question}</p>
          <div className="options-container">
            {decodedQuestions[currentQuestion].options.map((option, index) => (
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
              Question {currentQuestion + 1} of {decodedQuestions.length}
            </span>
            <button 
              className="next-button" 
              onClick={nextQuestion}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (currentQuestion < decodedQuestions.length - 1 ? 'Next' : 'Finish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exam;