import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkStudentExists } from '../services/firebaseService';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState({ name: '', documentType: '', documentId: '', placeOfExpedition: '' });
  const [isChecking, setIsChecking] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo({ ...studentInfo, [name]: value });
  };

  const startExam = async () => {
    console.log('startExam called with studentInfo:', studentInfo);
    if (!studentInfo.name || !studentInfo.documentType || !studentInfo.documentId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsChecking(true);
    
    try {
      // Check if student has already taken the exam
      const result = await checkStudentExists(studentInfo.documentType, studentInfo.documentId);
      
      if (result.exists) {
        alert(`This student (${studentInfo.documentType}: ${studentInfo.documentId}) has already taken the exam. You cannot take the exam again.`);
        setIsChecking(false);
        return;
      }
      
      // If student doesn't exist, proceed to survey
      console.log('Navigating to survey with state:', { studentInfo });
      navigate('/survey', { state: { studentInfo } });
    } catch (error) {
      console.error('Error checking existing student:', error);
      alert('Error checking student records. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-space">
          {/* Logo will be placed here */}
        </div>
        <h1>English Language Level Placement Test</h1>
        
        <form className="home-form">
          <input
            type="text"
            name="name"
            placeholder="Nombre Completo"
            value={studentInfo.name}
            onChange={handleChange}
          />
          <select
            name="documentType"
            value={studentInfo.documentType}
            onChange={handleChange}
          >
            <option value="">Seleccione el tipo de documento</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PP">Pasaporte</option>
            <option value="DNI">Documento Nacional de Identidad</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            name="documentId"
            placeholder="Número de documento"
            value={studentInfo.documentId}
            onChange={handleChange}
          />
          <input
            type="text"
            name="placeOfExpedition"
            placeholder="Lugar de expedición"
            value={studentInfo.placeOfExpedition}
            onChange={handleChange}
          />
          
          <div className="button-container">
            <button 
              type="button" 
              onClick={startExam}
              disabled={isChecking}
              className="primary-button"
            >
              {isChecking ? 'Verificando...' : 'Comenzar Examen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;