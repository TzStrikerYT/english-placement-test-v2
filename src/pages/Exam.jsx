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
  WwogIHsKICAgICJpZCI6IDEsCiAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBlcyBsYSBmb3JtYSBjb3JyZWN0YSBkZWwgdmVyYm8gdG8gYmU/IiwKICAgICJvcHRpb25zIjogWyJIZSBhcmUgaGFwcHkuIiwgIlNoZSBpcyBhIHN0dWRlbnQuIiwgIkkgaXMgdGlyZWQuIiwgIlRoZXkgYW0gcmVhZHkuIl0sCiAgICAiY29ycmVjdCI6IDEKICB9LAogIHsKICAgICJpZCI6IDIsCiAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBlcyBlbCBwbHVyYWwgZGUgY2hpbGQ/IiwKICAgICJvcHRpb25zIjogWyJDaGlsZHMiLCAiQ2hpbGRlcyIsICJDaGlsZHJlbiIsICJDaGlsZOKAmXMiXSwKICAgICJjb3JyZWN0IjogMgogIH0sCiAgewogICAgImlkIjogMywKICAgICJxdWVzdGlvbiI6ICLCv0N1w6FsIGVzIHVuIHN1c3RhbnRpdm8gbm8gY29udGFibGU/IiwKICAgICJvcHRpb25zIjogWyJBcHBsZXMiLCAiU3VnYXIiLCAiQ2hhaXJzIiwgIkJvb2tzIl0sCiAgICAiY29ycmVjdCI6IDEKICB9LAogIHsKICAgICJpZCI6IDQsCiAgICAicXVlc3Rpb24iOiAiRWxpZ2UgbGEgb3JhY2nDs24gY29ycmVjdGE6IiwKICAgICJvcHRpb25zIjogWyJUaGVyZSBpcyB0d28gZG9ncyBpbiB0aGUgcGFyay4iLCAiVGhlcmUgYXJlIGEgY2F0IG9uIHRoZSBzb2ZhLiIsICJUaGVyZSBhcmUgbWFueSBzdHVkZW50cyBpbiB0aGUgY2xhc3MuIiwgIlRoZXJlIGlzIHRocmVlIHBlbmNpbHMgb24gdGhlIHRhYmxlLiJdLAogICAgImNvcnJlY3QiOiAyCiAgfSwKICB7CiAgICAiaWQiOiA1LAogICAgInF1ZXN0aW9uIjogIsK/Q3XDoWwgb3BjacOzbiBlcyBjb3JyZWN0YSBwYXJhIGFsZ28gY2VyY2FubyB5IHNpbmd1bGFyPyIsCiAgICAib3B0aW9ucyI6IFsiVGhpcyIsICJUaGF0IiwgIlRoZXNlIiwgIlRob3NlIl0sCiAgICAiY29ycmVjdCI6IDAKICB9LAogIHsKICAgICJpZCI6IDYsCiAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCB2ZXJibyBtb2RhbCB1c2Ftb3MgcGFyYSBleHByZXNhciBoYWJpbGlkYWQ/IiwKICAgICJvcHRpb25zIjogWyJNdXN0IiwgIkNhbiIsICJTaG91bGQiLCAiTWlnaHQiXSwKICAgICJjb3JyZWN0IjogMQogIH0sCiAgewogICAgImlkIjogNywKICAgICJxdWVzdGlvbiI6ICJFbGlnZSBsYSBvcmFjacOzbiBjb3JyZWN0YSBjb24gY29tcGFyYXRpdm86IiwKICAgICJvcHRpb25zIjogWyJNeSBjYXIgaXMgZmFzdCB0aGFuIHlvdXJzLiIsICJNeSBob3VzZSBpcyBiaWdnZXIgdGhhbiBoaXMgaG91c2UuIiwgIlRoaXMgYm9vayBpcyB0aGUgbW9yZSBpbnRlcmVzdGluZy4iLCAiU2hlIGlzIG1vc3QgdGFsbCB0aGFuIG1lLiJdLAogICAgImNvcnJlY3QiOiAxCiAgfSwKICB7CiAgICAiaWQiOiA4LAogICAgInF1ZXN0aW9uIjogIkVsaWdlIGxhIG9yYWNpw7NuIGNvcnJlY3RhIGNvbiBzdXBlcmxhdGl2bzoiLAogICAgIm9wdGlvbnMiOiBbIlNoZSBpcyB0aGUgdGFsbGVzdCBnaXJsIGluIHRoZSBjbGFzcy4iLCAiSGUgaXMgbW9zdCBmYXN0LiIsICJUaGlzIGlzIHRoZSBtb3JlIGdvb2QgbW92aWUuIiwgIk15IGNhdCBpcyB0aGUgYmFkZGVzdC4iXSwKICAgICJjb3JyZWN0IjogMAogIH0sCiAgewogICAgImlkIjogOSwKICAgICJxdWVzdGlvbiI6ICJFbGlnZSBlbCBwbHVyYWwgY29ycmVjdG86IiwKICAgICJvcHRpb25zIjogWyJCb3hzIiwgIkJveGllcyIsICJCb3hlcyIsICJCb3giXSwKICAgICJjb3JyZWN0IjogMgogIH0sCiAgewogICAgImlkIjogMTAsCiAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBvcmFjacOzbiBlcyBjb3JyZWN0YT8iLAogICAgIm9wdGlvbnMiOiBbIlRoZXJlIGFyZSBzb21lIG1pbGsuIiwgIlRoZXJlIGlzIGEgbWlsay4iLCAiVGhlcmUgaXMgc29tZSBtaWxrLiIsICJUaGVyZSBhcmUgdHdvIG1pbGsuIl0sCiAgICAiY29ycmVjdCI6IDIKICB9LAogIHsKICAgICJpZCI6IDExLAogICAgInF1ZXN0aW9uIjogIsK/Q3XDoWwgb3BjacOzbiBlcyBjb3JyZWN0YT8iLAogICAgIm9wdGlvbnMiOiBbIlRob3NlIGNoYWlyIGlzIG5ldy4iLCAiVGhpcyBwZW5zIGFyZSByZWQuIiwgIlRoZXNlIGFwcGxlcyBhcmUgZnJlc2guIiwgIlRoYXQgYm9va3MgYXJlIG9sZC4iXSwKICAgICJjb3JyZWN0IjogMgogIH0sCiAgewogICAgImlkIjogMTIsCiAgICAicXVlc3Rpb24iOiAiwr9RdcOpIHByZXBvc2ljacOzbiBpbmRpY2EgbW92aW1pZW50byBoYWNpYSBhZGVudHJvPyIsCiAgICAib3B0aW9ucyI6IFsiSW50byIsICJPbiIsICJVbmRlciIsICJCZWhpbmQiXSwKICAgICJjb3JyZWN0IjogMAogIH0sCiAgewogICAgImlkIjogMTMsCiAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBXaC0gcXVlc3Rpb24gc2UgdXNhIHBhcmEgcHJlZ3VudGFyIHBvciBlbCBsdWdhcj8iLAogICAgIm9wdGlvbnMiOiBbIldoYXQiLCAiV2hlcmUiLCAiV2hlbiIsICJXaG8iXSwKICAgICJjb3JyZWN0IjogMQogIH0sCiAgewogICAgImlkIjogMTQsCiAgICAicXVlc3Rpb24iOiAiRWxpZ2UgbGEgb3BjacOzbiBjb3JyZWN0YSBjb24gdGhlcmUgYXJlOiIsCiAgICAib3B0aW9ucyI6IFsiVGhlcmUgYXJlIGFuIGFwcGxlLiIsICJUaGVyZSBhcmUgbWFueSBjYXJzLiIsICJUaGVyZSBhcmUgYSBkb2cuIiwgIlRoZXJlIGFyZSBzdWdhci4iXSwKICAgICJjb3JyZWN0IjogMQogIH0sCiAgewogICAgImlkIjogMTUsCiAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBvcmFjacOzbiB1c2Egc2hvdWxkIGNvcnJlY3RhbWVudGU/IiwKICAgICJvcHRpb25zIjogWyJZb3Ugc2hvdWxkIHRvIHN0dWR5LiIsICJZb3Ugc2hvdWxkIHN0dWRpZXMuIiwgIllvdSBzaG91bGQgc3R1ZHkuIiwgIllvdSBzaG91bGQgc3R1ZHlpbmcuIl0sCiAgICAiY29ycmVjdCI6IDIKICB9LAogIHsKICAgICJpZCI6IDE2LAogICAgInF1ZXN0aW9uIjogIkVsaWdlIGxhIG9yYWNpw7NuIGVuIHBhc2FkbyBzaW1wbGUgY29ycmVjdGE6IiwKICAgICJvcHRpb25zIjogWyJTaGUgZ28gdG8gdGhlIHBhcmsgeWVzdGVyZGF5LiIsICJUaGV5IGF0ZSBkaW5uZXIgbGFzdCBuaWdodC4iLCAiSGUgc3R1ZGllcyBFbmdsaXNoLiIsICJXZSBhcmUgd2F0Y2hpbmcgVFYgbm93LiJdLAogICAgImNvcnJlY3QiOiAxCiAgfSwKICB7CiAgICAiaWQiOiAxNywKICAgICJxdWVzdGlvbiI6ICLCv0N1w6FsIGVzIGxhIGZvcm1hIGNvcnJlY3RhIGRlbCBwcmVzZW50ZSBwZXJmZWN0bz8iLAogICAgIm9wdGlvbnMiOiBbIkkgaGFzIGZpbmlzaGVkIG15IGhvbWV3b3JrLiIsICJTaGUgaGF2ZSBzZWVuIHRoYXQgbW92aWUuIiwgIlRoZXkgaGF2ZSB0cmF2ZWxlZCB0byBKYXBhbi4iLCAiV2UgYXJlIHBsYXllZCBzb2NjZXIuIl0sCiAgICAiY29ycmVjdCI6IDIKICB9LAogIHsKICAgICJpZCI6IDE4LAogICAgInF1ZXN0aW9uIjogIkNvbXBsZXRhIGxhIG9yYWNpw7NuOiAnSWYgSSBfXyBhIG1pbGxpb24gZG9sbGFycywgSSB3b3VsZCBidXkgYSBiaWcgaG91c2UuJyIsCiAgICAib3B0aW9ucyI6IFsiaGFkIiwgImhhdmUiLCAid2lsbCBoYXZlIiwgIndvdWxkIGhhdmUiXSwKICAgICJjb3JyZWN0IjogMAogIH0sCiAgewogICAgImlkIjogMTksCiAgICAicXVlc3Rpb24iOiAiwr9RdcOpIG9wY2nDs24gZGVzY3JpYmUgbWVqb3IgZWwgdXNvIGRlICd1c2VkIHRvJz8iLAogICAgIm9wdGlvbnMiOiBbIlRvIHRhbGsgYWJvdXQgZnV0dXJlIGhhYml0cy4iLCAiVG8gZGVzY3JpYmUgYWN0aW9ucyBoYXBwZW5pbmcgbm93LiIsICJUbyB0YWxrIGFib3V0IHBhc3QgaGFiaXRzIG9yIHN0YXRlcyB0aGF0IG5vIGxvbmdlciBoYXBwZW4uIiwgIlRvIGV4cHJlc3Mgb2JsaWdhdGlvbiBpbiB0aGUgcHJlc2VudC4iXSwKICAgICJjb3JyZWN0IjogMgogIH0sCiAgewogICAgImlkIjogMjAsCiAgICAicXVlc3Rpb24iOiAiRWxpZ2UgbGEgb3JhY2nDs24gZW4gdm96IHBhc2l2YSBjb3JyZWN0YToiLAogICAgIm9wdGlvbnMiOiBbIlRoZSBib3kga2lja2VkIHRoZSBiYWxsLiIsICJUaGUgYmFsbCB3YXMga2lja2VkIGJ5IHRoZSBib3kuIiwgIlRoZSBiYWxsIGtpY2tzIHRoZSBib3kuIiwgIktpY2tpbmcgdGhlIGJhbGwgYnkgdGhlIGJveS4iXSwKICAgICJjb3JyZWN0IjogMQogIH0sCiAgewogICAgImlkIjogMjEsCiAgICAicXVlc3Rpb24iOiAiQ29tcGxldGEgbGEgb3JhY2nDs246ICdTaGUgaXMgaW50ZXJlc3RlZCBfXyBsZWFybmluZyBuZXcgbGFuZ3VhZ2VzLiciLAogICAgIm9wdGlvbnMiOiBbIm9uIiwgImluIiwgImFib3V0IiwgImF0Il0sCiAgICAiY29ycmVjdCI6IDEKICB9LAogIHsKICAgICJpZCI6IDIyLAogICAgInF1ZXN0aW9uIjogIsK/UXXDqSBzaWduaWZpY2EgZWwgcGhyYXNhbCB2ZXJiICd0dXJuIGRvd24nPyIsCiAgICAib3B0aW9ucyI6IFsiVG8gaW5jcmVhc2UgdGhlIHZvbHVtZS4iLCAiVG8gYWNjZXB0IGFuIG9mZmVyLiIsICJUbyByZWR1Y2UgdGhlIHZvbHVtZSBvciByZWplY3QgYW4gb2ZmZXIuIiwgIlRvIHR1cm4gb2ZmIGFuIGFwcGxpYW5jZS4iXSwKICAgICJjb3JyZWN0IjogMgogIH0sCiAgewogICAgImlkIjogMjMsCiAgICAicXVlc3Rpb24iOiAiRWxpZ2UgbGEgb3JhY2nDs24gY29ycmVjdGEgY29uICd0b28nIG8gJ2Vub3VnaCc6IiwKICAgICJvcHRpb25zIjogWyJJdCdzIHRvbyBjb2xkIHRvIGdvIG91dC4iLCAiU2hlJ3MgZW5vdWdoIHRhbGwgdG8gcmVhY2ggdGhlIHNoZWxmLiIsICJIZSBoYXMgdG9vIG1vbmV5LiIsICJUaGUgc291cCBpcyBob3QgZW5vdWdoIHRvbyBlYXQuIl0sCiAgICAiY29ycmVjdCI6IDAKICB9LAogIHsKICAgICJpZCI6IDI0LAogICAgInF1ZXN0aW9uIjogIsK/Q3XDoWwgZXMgbGEgZm9ybWEgY29ycmVjdGEgZGVsIGZ1dHVybyBjb24gJ3dpbGwnPyIsCiAgICAib3B0aW9ucyI6IFsiSSB3aWxsIHRvIHZpc2l0IG15IGdyYW5kcGFyZW50cy4iLCAiU2hlIHdpbGwgZ29lcyB0byB0aGUgcGFydHkuIiwgIlRoZXkgd2lsbCB0cmF2ZWwgbmV4dCBtb250aC4iLCAiSGUgd2lsbCBiZSBzdHVkeWluZyBub3cuIl0sCiAgICAiY29ycmVjdCI6IDIKICB9LAogIHsKICAgICJpZCI6IDI1LAogICAgInF1ZXN0aW9uIjogIkVsaWdlIGxhIG9wY2nDs24gcXVlIHVzYSBlbCBwcmVzZW50ZSBjb250aW51byBwYXJhIHVuIGZ1dHVybyBwbGFuaWZpY2FkbzoiLAogICAgIm9wdGlvbnMiOiBbIkkgd2lsbCBtZWV0IG15IGZyaWVuZCB0b21vcnJvdy4iLCAiU2hlIGlzIG1lZXRpbmcgaGVyIGJvc3Mgb24gTW9uZGF5LiIsICJUaGV5IG1lZXQgdGhlaXIgY291c2lucyBuZXh0IHdlZWsuIiwgIkhlIG1lZXRzIGhpcyB0ZWFjaGVyIHllc3RlcmRheS4iXSwKICAgICJjb3JyZWN0IjogMQogIH0sCiAgewogICAgImlkIjogMjYsCiAgICAicXVlc3Rpb24iOiAiwr9DdcOhbCBlcyBlbCBzaWduaWZpY2FkbyBkZSAnbG9vayBmb3J3YXJkIHRvJz8iLAogICAgIm9wdGlvbnMiOiBbIlRvIGxvb2sgYmFjayBhdCB0aGUgcGFzdC4iLCAiVG8gYW50aWNpcGF0ZSBzb21ldGhpbmcgd2l0aCBwbGVhc3VyZS4iLCAiVG8gc2VhcmNoIGZvciBzb21ldGhpbmcuIiwgIlRvIGlnbm9yZSBzb21ldGhpbmcuIl0sCiAgICAiY29ycmVjdCI6IDEKICB9LAogIHsKICAgICJpZCI6IDI3LAogICAgInF1ZXN0aW9uIjogIkNvbXBsZXRhIGxhIG9yYWNpw7NuOiAnU2hlIGhhcyBiZWVuIHN0dWR5aW5nIEVuZ2xpc2ggX18gZml2ZSB5ZWFycy4nIiwKICAgICJvcHRpb25zIjogWyJzaW5jZSIsICJmb3IiLCAiZHVyaW5nIiwgImluIl0sCiAgICAiY29ycmVjdCI6IDEKICB9LAogIHsKICAgICJpZCI6IDI4LAogICAgInF1ZXN0aW9uIjogIkVsaWdlIGxhIG9yYWNpw7NuIGNvcnJlY3RhIGNvbiAnbWFrZScgbyAnZG8nOiIsCiAgICAib3B0aW9ucyI6IFsiSSBuZWVkIHRvIG1ha2UgbXkgaG9tZXdvcmsuIiwgIkNhbiB5b3UgZG8gYSBmYXZvcj8iLCAiU2hlIGRpZCBhIGRlY2lzaW9uLiIsICJXZSBhcmUgbWFraW5nIGV4ZXJjaXNlLiJdLAogICAgImNvcnJlY3QiOiAxCiAgfSwKICB7CiAgICAiaWQiOiAyOSwKICAgICJxdWVzdGlvbiI6ICLCv0N1w6FsIGRlIGxhcyBzaWd1aWVudGVzIGVzIHVuYSBjbMOhdXN1bGEgcmVsYXRpdmEgbm8gcmVzdHJpY3RpdmE/IiwKICAgICJvcHRpb25zIjogWyJUaGUgbWFuIHdobyBsaXZlcyBuZXh0IGRvb3IgaXMgZnJpZW5kbHkuIiwgIk15IGJyb3RoZXIsIHdobyBpcyBhIGRvY3RvciwgbGl2ZXMgaW4gTG9uZG9uLiIsICJUaGlzIGlzIHRoZSBib29rIHRoYXQgSSBib3Jyb3dlZC4iLCAiVGhlIGNhciB0aGF0IGlzIHBhcmtlZCBvdXRzaWRlIGlzIG1pbmUuIl0sCiAgICAiY29ycmVjdCI6IDEKICB9LAogIHsKICAgICJpZCI6IDMwLAogICAgInF1ZXN0aW9uIjogIkNvbXBsZXRhIGxhIG9yYWNpw7NuOiAnSWYgSSBoYWQga25vd24sIEkgX18gaGF2ZSBoZWxwZWQgeW91LiciLAogICAgIm9wdGlvbnMiOiBbIndvdWxkIiwgIndpbGwiLCAiY2FuIiwgInNob3VsZCJdLAogICAgImNvcnJlY3QiOiAwCiAgfQpd
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