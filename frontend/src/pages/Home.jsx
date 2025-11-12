import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "../features/authSlice";


const Home = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  const [loadingMyQuizzes, setLoadingMyQuizzes] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file:", file.name);
      const response = await axios.post(
        "http://localhost:3000/api/pdf/getData",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response:", response.data);

      if (response.data.success) {
        setResult(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Failed to extract PDF");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Error uploading file. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!result || !result.text) {
      setError('Please upload a PDF first!');
      return;
    }

    if (!token) {
      setError('Please login to generate quizzes');
      navigate('/login');
      return;
    }

    setQuizLoading(true);
    setError(null);

    try {
      console.log('Generating quiz...');
      const response = await axios.post('http://localhost:3000/api/quiz/generate', {
        text: result.text,
        numQuestions: parseInt(numQuestions),
        difficulty: difficulty,
        title: `Quiz from ${file?.name || 'PDF'}`
      }, {
        withCredentials: true
      });

      console.log('Quiz Response:', response.data);
      
      if (response.data.success) {
        alert('Quiz generated successfully!');
        navigate('/quiz');
      } else {
        setError(response.data.message || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error generating quiz. Please try again.';
      setError(errorMsg);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleViewMyQuizzes = async () => {
    if (!token) {
      setError('Please login to view your quizzes');
      navigate('/login');
      return;
    }

    setLoadingMyQuizzes(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:3000/api/quiz/my-quizzes', {
        withCredentials: true
      });

      if (response.data.success) {
        setMyQuizzes(response.data.data);
        setShowMyQuizzes(true);
      } else {
        setError(response.data.message || 'Failed to fetch your quizzes');
      }
    } catch (err) {
      console.error('Error fetching my quizzes:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error fetching your quizzes.';
      setError(errorMsg);
    } finally {
      setLoadingMyQuizzes(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ textAlign: 'center', flex: 1 }}>PDF Quiz Generator</h1>
        {user && (
          <button
            onClick={handleViewMyQuizzes}
            disabled={loadingMyQuizzes}
            style={{
              padding: '10px 20px',
              backgroundColor: loadingMyQuizzes ? '#ccc' : '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loadingMyQuizzes ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loadingMyQuizzes ? 'Loading...' : 'My Quizzes'}
          </button>
        )}
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Upload PDF:
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px dashed #ddd',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Uploading...' : 'Upload & Extract Text'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: '30px' }}>
            <h3>PDF Extracted Successfully!</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Pages:</strong> {result.numPages}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Text Preview:</strong>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#f5f5f5', 
                padding: '15px',
                borderRadius: '5px',
                maxHeight: '200px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {result.text.substring(0, 500)}...
              </pre>
            </div>

            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <h3>Generate Quiz</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Number of Questions:
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Difficulty:
                </label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <button 
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: quizLoading ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: quizLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {quizLoading ? 'Generating Quiz...' : 'Generate Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showMyQuizzes && (
        <div style={{ 
          marginTop: '30px',
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>My Quizzes ({myQuizzes.length})</h2>
            <button
              onClick={() => setShowMyQuizzes(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
          
          {myQuizzes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              You haven't created any quizzes yet. Upload a PDF and generate your first quiz!
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {myQuizzes.map((quiz) => (
                <div 
                  key={quiz._id}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onClick={() => navigate('/quiz', { state: { quizId: quiz._id } })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h3 style={{ marginBottom: '10px', color: '#333' }}>{quiz.title}</h3>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                    {quiz.description}
                  </p>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#888' }}>
                    <span>📝 {quiz.totalQuestions} questions</span>
                    <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
