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
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificado Bilingües</title>
          <style>
              body {
                  font-family: 'Calibri', 'Arial', sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: white;
                  font-size: 12px;
                  line-height: 1.2;
              }
              
              .certificate-container {
                  max-width: 8.5in;
                  margin: 0 auto;
                  padding: 20px;
                  background: white;
              }
              
              .header {
                  text-align: center;
                  margin-bottom: 20px;
              }
              
              .logo-section {
                  text-align: center;
                  margin-bottom: 15px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
              }
              
              .logo-image {
                  max-width: 350px;
                  height: auto;
                  display: block;
              }
              
              .accreditation {
                  font-size: 10px;
                  text-align: justify;
                  margin: 10px 0;
                  line-height: 1.3;
              }
              
              .certifica-title {
                  text-align: center;
                  font-size: 20px;
                  font-weight: bold;
                  margin: 15px 0;
                  letter-spacing: 2px;
              }
              
              .student-info {
                  text-align: justify;
                  margin: 10px 0;
                  font-size: 12px;
                  line-height: 1.4;
              }
              
              .results-table {
                  margin: 15px auto;
                  border-collapse: collapse;
                  width: 300px;
              }
              
              .results-table td {
                  border: 1px solid #000;
                  padding: 6px;
                  text-align: center;
                  font-size: 11px;
              }
              
              .skill-header {
                  background-color: #e6f3ff;
                  font-weight: bold;
              }
              
              .level-statement {
                  text-align: center;
                  margin: 15px 0;
                  font-size: 12px;
              }
              
              .competency-descriptions {
                  margin: 15px 0;
                  text-align: justify;
              }
              
              .competency-section {
                  margin-bottom: 8px;
                  font-size: 10px;
                  line-height: 1.3;
              }
              
              .date-location {
                  text-align: center;
                  margin: 20px 0;
                  font-size: 12px;
              }
              
              .signature-section {
                  text-align: center;
                  margin: 20px 0;
              }
              
              .signature-image {
                  max-width: 150px;
                  height: auto;
                  margin: 5px auto;
                  display: block;
              }
              
              .coordinator-name {
                  font-weight: bold;
                  margin: 5px 0;
                  font-size: 12px;
              }
              
              .coordinator-title {
                  font-size: 11px;
                  margin: 2px 0;
              }
              
              .contact-info {
                  border-top: 1px solid #000;
                  padding-top: 15px;
                  text-align: center;
                  margin-top: 20px;
                  font-size: 10px;
              }
              
              .contact-info p {
                  margin: 3px 0;
              }
              
              .email-link {
                  color: #0066cc;
                  text-decoration: underline;
              }
          </style>
      </head>
      <body>
          <div class="certificate-container">
              <div class="header">
                  <div class="logo-section">
                      <img src="Resources/logo_con_letras.jpeg" alt="Logo Bilingües Centro Colombiano de Lenguas Modernas" class="logo-image">
                  </div>
                  
                  <div class="accreditation">
                      El Coordinador Académico del Centro Colombiano de Lenguas Modernas Bilingües entidad privada con resolución oficial, 
                      expedida por la Secretaría de Educación de Bogotá No: 06-091 del 2024 y 06-023 del 2021, con NIT 900260014-0 por la cual 
                      se reconoce la prestación del servicio educativo formal laboral para el Trabajo y Desarrollo Humano:
                  </div>
              </div>
              
              <div class="certifica-title">CERTIFICA</div>
              
              <div class="student-info">
                  Que el (la) estudiante(a) <strong>${student.studentName}</strong> con P.P.T. <strong>${student.documentNumber}</strong> de ${student.placeOfExpedition || student.city}, obtuvo en 
                  su <strong>EXAMEN DE CLASIFICACIÓN DE NIVEL DE INGLÉS</strong> las siguientes puntuaciones de suficiencia:
              </div>
              
              <table class="results-table">
                  <tr>
                      <td class="skill-header">LISTENING</td>
                      <td>${student.listeningPercentage}% - 100%</td>
                  </tr>
                  <tr>
                      <td class="skill-header">SPEAKING</td>
                      <td>${student.speakingPercentage}% - 100%</td>
                  </tr>
                  <tr>
                      <td class="skill-header">READING</td>
                      <td>${student.readingPercentage || 'N/A'}% - 100%</td>
                  </tr>
                  <tr>
                      <td class="skill-header">WRITING</td>
                      <td>${student.writingPercentage}% - 100%</td>
                  </tr>
                  <tr>
                      <td class="skill-header">GRAMMAR</td>
                      <td>${student.grammarPercentage}% - 100%</td>
                  </tr>
              </table>
              
              <div class="level-statement">
                  Según esta puntuación el estudiante alcanza el nivel requerido de <strong>INGLÉS ${student.reachedLevel}</strong><br>
                  según el Marco Común Europeo (MCER):
              </div>
              
              <div class="competency-descriptions">
                  <div class="competency-section">
                      <strong>LISTENING:</strong> El estudiante demuestra un nivel ${student.reachedLevel} sólido en la habilidad de escuchar, lo que le alcanzando una competencia del ${student.listeningPercentage}% en esta área. Su capacidad para 
                      comprender el inglés hablado le permite seguir conversaciones y obtener información general de audios y videos con un nivel de complejidad. Es capaz de seguir la idea 
                      principal y algunos detalles específicos de diálogos y mensajes cortos, incluso cuando se presenta en un contexto conocido y con vocabulario familiar.
                  </div>
                  
                  <div class="competency-section">
                      <strong>SPEAKING:</strong> El estudiante alcanza un nivel ${student.reachedLevel} sólido en esta área. Puede comunicarse de manera efectiva en situaciones 
                      comunicativas del ${student.speakingPercentage}% en esta área. Puede intercambiar información de manera efectiva sobre temas familiares, aunque su fluidez y precisión requieren mejoras. Es capaz de expresar opiniones, hacer preguntas y mantener conversaciones complejas sobre temas 
                      familiares, aunque su fluidez y precisión requieren mejoras. Es competente para participar en diálogos simples y responder a preguntas básicas sobre su entorno inmediato.
                  </div>
                  
                  <div class="competency-section">
                      <strong>READING:</strong> El estudiante alcanza un nivel ${student.reachedLevel} sólido en la habilidad de lectura, con un porcentaje del ${student.readingPercentage || 'N/A'}%. Esto significa que puede leer y comprender textos extensos y 
                      complejos sobre temas conocidos. Es capaz de identificar información principal y algunos detalles relevantes en artículos, instrucciones y mensajes escritos, así como entender 
                      el sentido general de textos más largos. Su habilidad le permite seguir argumentos en textos bien estructurados y seguir la línea argumental de textos descriptivos, aunque requiere apoyo 
                      para su nivel.
                  </div>
                  
                  <div class="competency-section">
                      <strong>WRITING:</strong> El estudiante presenta un nivel ${student.reachedLevel} sólido en esta área. Puede producir textos claros y simples sobre temas familiares, como 
                      descripciones de sí mismo o de su entorno, y mensajes informales. Aunque su escritura puede contener errores gramaticales y ortográficos, es capaz de organizar sus ideas 
                      de manera coherente y utilizar frases y vocabulario complejos para comunicarse. Esta competencia le permite expresar sus pensamientos y puntos de vista de manera cotidiana.
                  </div>
                  
                  <div class="competency-section">
                      <strong>GRAMMAR:</strong> El estudiante muestra un nivel ${student.reachedLevel} sólido en la gramática, con un porcentaje del ${student.grammarPercentage}%. Su comprensión de las estructuras gramaticales complejas le permite utilizar 
                      tiempos verbales compuestos, formar oraciones complejas y aplicar reglas fundamentales del idioma. Aunque todavía puede tener algunas dificultades con estructuras más 
                      complejas y errores gramaticales ocasionales, su conocimiento y aplicación de la gramática son suficientes para comunicarse con claridad y comprensión en situaciones 
                      cotidianas.
                  </div>
              </div>
              
              <div class="date-location">
                  Dada en Bogotá D.C a los ${new Date().getDate().toString().padStart(2, '0')} días del mes de ${new Date().toLocaleDateString('es-ES', { month: 'long' })} de ${new Date().getFullYear()} a solicitud del(la) interesado(a).
              </div>
              
              <div class="signature-section">
                  <img src="Resources/firma_cesar.jpeg" alt="Firma César Rodríguez" class="signature-image">
                  <div class="coordinator-name">CÉSAR RODRÍGUEZ RODRÍGUEZ.</div>
                  <div class="coordinator-title">COORDINADOR ACADÉMICO</div>
                  <div class="coordinator-title">CONVENIO BILINGÜES – INNOVAR</div>
              </div>
              
              <div class="contact-info">
                  <p><strong>Dirección:</strong> Diagonal 47ª Nº 53 46 sur – Barrio Venecia Bogotá D.C.</p>
                  <p><strong>Tel:</strong> 318 372 51 83 <strong>Web:</strong> www.bilingues.edu.co</p>
                  <p><strong>E-mail:</strong> <span class="email-link">coordinacion@bilingues.edu.co</span> <strong>Facebook:</strong> Programas Técnicos Bilingües</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = certificateHTML;

    const opt = {
      margin: 0.2,
      filename: `Certificado_${student.studentName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
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
                        <span>R: {student.readingPercentage || 0}%</span>
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
                      <span>R: {searchResults.readingPercentage || 0}%</span>
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
                      <span>Reading:</span>
                      <span>{selectedStudent.readingPercentage || 0}%</span>
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
                    <span>R: {student.readingPercentage || 0}%</span>
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