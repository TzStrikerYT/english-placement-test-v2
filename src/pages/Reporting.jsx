import React, { useState, useEffect } from 'react';
import { getAllStudents, getStudentData } from '../services/firebaseService';
import html2pdf from 'html2pdf.js';
import './Reporting.css';

function Reporting() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('documentId');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    loadAllStudents();
  }, []);

  const loadAllStudents = async () => {
    try {
      setLoading(true);
      const result = await getAllStudents();
      if (result.success) {
        setStudents(result.data);
      } else {
        console.error('Failed to load students:', result.message);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchStudent = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      let result;
      
      if (searchType === 'documentId') {
        // For document ID search, we need both document type and ID
        const parts = searchTerm.split('_');
        if (parts.length === 2) {
          result = await getStudentData(parts[0], parts[1]);
        } else {
          alert('Please enter document ID in format: TYPE_ID (e.g., CC_12345678)');
          return;
        }
      } else {
        // For name search, filter from loaded students
        const filtered = students.filter(student => 
          student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        result = { success: true, data: filtered };
      }

      if (result.success) {
        setSearchResults(result.data);
        if (Array.isArray(result.data) && result.data.length === 1) {
          setSelectedStudent(result.data[0]);
        }
      } else {
        setSearchResults(null);
        alert('Student not found');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      alert('Error searching for student');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = (student) => {
    if (!student) {
      alert('Please select a student first');
      return;
    }

    const certificateHTML = `
      <div class="certificate-container">
        <div class="certificate-header">
          <h1>Certificado de evaluación de nivel de inglés</h1>
          <div class="logo">Bilingues</div>
        </div>
        
        <div class="certificate-body">
          <div class="certificate-content">
            <p class="certificate-text">
              El siguiente documento certifica que <strong>${student.studentName}</strong>, con el documento de identificación ${student.documentType} ${student.documentNumber}, expedido en ${student.placeOfExpedition}, ha completado el examen de nivel de inglés y ha obtenido los siguientes resultados:
            </p>
            
            <div class="results-grid">
              <div class="result-item">
                <span class="skill">Listening:</span>
                <span class="percentage">${student.listeningPercentage}%</span>
              </div>
              <div class="result-item">
                <span class="skill">Speaking:</span>
                <span class="percentage">${student.speakingPercentage}%</span>
              </div>
              <div class="result-item">
                <span class="skill">Writing:</span>
                <span class="percentage">${student.writingPercentage}%</span>
              </div>
              <div class="result-item">
                <span class="skill">Grammar:</span>
                <span class="percentage">${student.grammarPercentage}%</span>
              </div>
            </div>
            
            <div class="level-result">
              <p>Segun esta puntuación el estudiante alcanza el nivel requerido de: <span class="level">${student.reachedLevel}</span> Según el Marco Común Europeo (MCER)</p>
            </div>
          </div>
          
          <div class="certificate-footer">
            <p class="date">Fecha de emisión: ${new Date(student.updatedAt?.toDate() || student.updatedAt || Date.now()).toLocaleDateString()}</p>
            <p class="signature">Bilingues Centro de lenguas</p>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = certificateHTML;
    element.className = 'certificate-wrapper';
    
    // Add certificate styles
    const style = document.createElement('style');
    style.textContent = `
      .certificate-wrapper {
        font-family: 'Times New Roman', serif;
        width: 8.5in;
        height: 11in;
        margin: 0 auto;
        padding: 0.25in;
        background: white;
        border: 3px solid #gold;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        box-sizing: border-box;
        overflow: hidden;
      }
      .certificate-container {
        text-align: center;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
      .certificate-header {
        border-bottom: 2px solid #gold;
        padding-bottom: 10px;
        margin-bottom: 15px;
        flex-shrink: 0;
      }
      .certificate-header h1 {
        color: #2c3e50;
        font-size: 18px;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.1;
        word-wrap: break-word;
      }
      .logo {
        font-size: 16px;
        font-weight: bold;
        color: #e74c3c;
        margin-top: 5px;
      }
      .certificate-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        min-height: 0;
      }
      .certificate-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        min-height: 0;
        margin-top: 10px;
      }
      .certificate-text {
        font-size: 13px;
        line-height: 1.3;
        margin-bottom: 15px;
        text-align: justify;
        flex-shrink: 0;
        word-wrap: break-word;
        hyphens: auto;
      }
      .results-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 15px 0;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
        flex-shrink: 0;
      }
      .result-item {
        display: flex;
        justify-content: space-between;
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
      }
      .skill {
        font-weight: bold;
        color: #2c3e50;
      }
      .percentage {
        color: #e74c3c;
        font-weight: bold;
      }
      .level-result {
        margin: 15px 0;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
        flex-shrink: 0;
      }
      .level-result h3 {
        margin: 0;
        color: #2c3e50;
        font-size: 14px;
      }
      .level {
        color: #e74c3c;
        font-size: 16px;
      }
      .certificate-footer {
        margin-top: auto;
        border-top: 2px solid #gold;
        padding-top: 10px;
        flex-shrink: 0;
      }
      .date {
        font-style: italic;
        color: #666;
        font-size: 11px;
        margin: 3px 0;
      }
      .signature {
        font-weight: bold;
        color: #2c3e50;
        margin-top: 5px;
        font-size: 13px;
      }
      @media print {
        .certificate-wrapper {
          width: 8.5in;
          height: 11in;
          margin: 0;
          padding: 0.25in;
          border: none;
          box-shadow: none;
        }
      }
    `;
    element.appendChild(style);

    const opt = {
      margin: 1,
      filename: `certificate_${student.studentName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    setSelectedStudent(null);
  };

  return (
    <div className="reporting-container">
      <div className="reporting-content">
        <div className="reporting-header">
          <h1>Student Reporting & Certificates</h1>
          <p>Generate certificates and view student assessment results</p>
        </div>

        <div className="search-section">
          <h2>Search Students</h2>
          <div className="search-controls">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="search-type-select"
            >
              <option value="documentId">Document ID (TYPE_ID)</option>
              <option value="name">Student Name</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchType === 'documentId' ? 'e.g., CC_12345678' : 'Enter student name'}
              className="search-input"
            />
            <button onClick={searchStudent} className="search-button">
              Search
            </button>
            <button onClick={clearSearch} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        <div className="results-section">
          {loading && <div className="loading">Loading...</div>}
          
          {searchResults && (
            <div className="search-results">
              <h3>Search Results</h3>
              {Array.isArray(searchResults) ? (
                searchResults.map((student, index) => (
                  <div key={index} className="student-card">
                    <div className="student-info">
                      <h4>{student.studentName}</h4>
                      <p>Document: {student.documentType} - {student.documentNumber}</p>
                      <p>Level: {student.reachedLevel}</p>
                      <div className="scores">
                        <span>L: {student.listeningPercentage}%</span>
                        <span>S: {student.speakingPercentage}%</span>
                        <span>W: {student.writingPercentage}%</span>
                        <span>G: {student.grammarPercentage}%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="select-button"
                    >
                      Select
                    </button>
                  </div>
                ))
              ) : (
                <div className="student-card">
                  <div className="student-info">
                    <h4>{searchResults.studentName}</h4>
                    <p>Document: {searchResults.documentType} - {searchResults.documentNumber}</p>
                    <p>Level: {searchResults.reachedLevel}</p>
                    <div className="scores">
                      <span>L: {searchResults.listeningPercentage}%</span>
                      <span>S: {searchResults.speakingPercentage}%</span>
                      <span>W: {searchResults.writingPercentage}%</span>
                      <span>G: {searchResults.grammarPercentage}%</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedStudent(searchResults)}
                    className="select-button"
                  >
                    Select
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedStudent && (
            <div className="selected-student">
              <h3>Selected Student: {selectedStudent.studentName}</h3>
              <div className="student-details">
                <p><strong>Document:</strong> {selectedStudent.documentType} - {selectedStudent.documentNumber}</p>
                <p><strong>City:</strong> {selectedStudent.city}</p>
                <p><strong>Level:</strong> {selectedStudent.reachedLevel}</p>
                <div className="detailed-scores">
                  <h4>Assessment Scores:</h4>
                  <div className="score-grid">
                    <div className="score-item">
                      <span>Listening:</span>
                      <span>{selectedStudent.listeningPercentage}%</span>
                    </div>
                    <div className="score-item">
                      <span>Speaking:</span>
                      <span>{selectedStudent.speakingPercentage}%</span>
                    </div>
                    <div className="score-item">
                      <span>Writing:</span>
                      <span>{selectedStudent.writingPercentage}%</span>
                    </div>
                    <div className="score-item">
                      <span>Grammar:</span>
                      <span>{selectedStudent.grammarPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => generateCertificate(selectedStudent)}
                className="generate-certificate-button"
              >
                Generate Certificate
              </button>
            </div>
          )}
        </div>

        <div className="all-students-section">
          <h2>All Students ({students.length})</h2>
          <div className="students-grid">
            {students.map((student, index) => (
              <div key={index} className="student-card">
                <div className="student-info">
                  <h4>{student.studentName}</h4>
                  <p>Document: {student.documentType} - {student.documentNumber}</p>
                  <p>Level: {student.reachedLevel}</p>
                  <div className="scores">
                    <span>L: {student.listeningPercentage}%</span>
                    <span>S: {student.speakingPercentage}%</span>
                    <span>W: {student.writingPercentage}%</span>
                    <span>G: {student.grammarPercentage}%</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(student)}
                  className="select-button"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reporting; 