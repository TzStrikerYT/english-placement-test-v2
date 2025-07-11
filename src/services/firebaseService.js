import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';

const COLLECTION_NAME = 'notes';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    console.log('DB object:', db);
    
    // Simple test: Try to write to 'notes' collection
    const testDocRef = doc(db, 'notes', 'test-connection');
    const testData = {
      test: true,
      timestamp: new Date(),
      message: 'Firebase connection test'
    };
    
    console.log('Attempting to write test document to notes collection...');
    await setDoc(testDocRef, testData);
    console.log('Success: Test document written to notes collection!');
    
    return { success: true, message: 'Firebase connection and write permissions working' };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error: error.message, code: error.code };
  }
};

// Save student data to Firestore
export const saveStudentData = async (studentData) => {
  try {
    console.log('saveStudentData called with:', studentData);
    
    // Validate required fields
    if (!studentData.documentType || !studentData.documentId) {
      throw new Error('Missing required fields: documentType and documentId');
    }
    
    // Create a unique document ID using document number and type
    const docId = `${studentData.documentType}_${studentData.documentId}`;
    console.log('Generated docId:', docId);
    
    const docRef = doc(db, COLLECTION_NAME, docId);
    console.log('Document reference created:', docRef);
    
    // Prepare the data object - simplified to match working direct write
    const dataToSave = {
      studentName: studentData.name || '',
      documentType: studentData.documentType,
      documentNumber: studentData.documentId,
      placeOfExpedition: studentData.placeOfExpedition || '',
      city: studentData.city || '',
      listeningPercentage: studentData.listeningPercentage || 0,
      writingPercentage: studentData.writingPercentage || 0,
      grammarPercentage: studentData.grammarPercentage || 0,
      speakingPercentage: studentData.speakingPercentage || 0,
      readingPercentage: studentData.readingPercentage || 0,
      reachedLevel: studentData.reachedLevel || 'Not evaluated',
      // Store exam questions and answers for results display
      examQuestions: studentData.examResults?.questions || [],
      examAnswers: studentData.examResults?.answers || [],
      surveyResults: studentData.surveyResults || {},
      finalSurveyResults: studentData.finalSurveyResults || {},
      disqualified: studentData.disqualified || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Data to save:', dataToSave);
    console.log('About to call setDoc...');

    await setDoc(docRef, dataToSave);
    
    console.log('Student data saved successfully:', docId);
    return { success: true, docId };
  } catch (error) {
    console.error('Error saving student data:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

// Get student data by document ID
export const getStudentData = async (documentType, documentId) => {
  try {
    const docId = `${documentType}_${documentId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, message: 'Student not found' };
    }
  } catch (error) {
    console.error('Error getting student data:', error);
    throw error;
  }
};

// Check if student has already taken the exam
export const checkStudentExists = async (documentType, documentId) => {
  try {
    const docId = `${documentType}_${documentId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const studentData = docSnap.data();
      return { 
        exists: true, 
        data: studentData,
        message: 'Student has already taken the exam'
      };
    } else {
      return { 
        exists: false, 
        message: 'Student not found in database'
      };
    }
  } catch (error) {
    console.error('Error checking if student exists:', error);
    throw error;
  }
};

// Get all students
export const getAllStudents = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const students = [];
    
    querySnapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: students };
  } catch (error) {
    console.error('Error getting all students:', error);
    throw error;
  }
};

// Update student data
export const updateStudentData = async (documentType, documentId, updateData) => {
  try {
    const docId = `${documentType}_${documentId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    await setDoc(docRef, dataToUpdate, { merge: true });
    
    console.log('Student data updated successfully:', docId);
    return { success: true, docId };
  } catch (error) {
    console.error('Error updating student data:', error);
    throw error;
  }
};

// Calculate percentages from exam results
export const calculatePercentages = (examResults) => {
  if (!examResults || !examResults.answers) {
    return {
      writingPercentage: 0,
      readingPercentage: 0
    };
  }

  const answers = examResults.answers;
  const questions = examResults.questions || [];
  
  if (questions.length === 0) {
    console.warn('No questions provided for percentage calculation');
    return {
      writingPercentage: 0,
      readingPercentage: 0
    };
  }

  let correctAnswers = 0;
  
  // Check each answer against the correct answer
  for (let i = 0; i < answers.length && i < questions.length; i++) {
    const studentAnswer = answers[i];
    const correctAnswer = questions[i].correct;
    
    // Check if the student's answer matches the correct answer
    if (studentAnswer !== null && studentAnswer !== undefined && studentAnswer === correctAnswer) {
      correctAnswers++;
    }
  }
  
  const totalQuestions = Math.min(answers.length, questions.length);
  const percentage = totalQuestions > 0 ? parseFloat(((correctAnswers / totalQuestions) * 100).toFixed(2)) : 0;
  
  console.log(`Exam results: ${correctAnswers} correct out of ${totalQuestions} questions = ${percentage}%`);
  
  return {
    writingPercentage: percentage,
    readingPercentage: percentage
  };
};

// Calculate reached level based on percentages
export const calculateReachedLevel = (percentages) => {
  const avgPercentage = (
    percentages.listeningPercentage + 
    percentages.writingPercentage + 
    percentages.grammarPercentage + 
    percentages.speakingPercentage +
    percentages.readingPercentage
  ) / 5;

  // MCER levels with maximum of B1
  if (avgPercentage >= 90) return 'B2';
  if (avgPercentage >= 75) return 'B1';
  if (avgPercentage >= 60) return 'A2';
  return 'A1';
}; 