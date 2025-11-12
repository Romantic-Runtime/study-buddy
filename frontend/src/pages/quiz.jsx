import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('view'); // 'view' or 'take'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchQuizzes();
  }, [isAuthenticated, navigate]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/quiz');
      
      if (response.data.success) {
        setQuizzes(response.data.data);
      } else {
        setError('Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.response?.data?.message || 'Error fetching quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizMode('view');
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizMode('take');
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleCloseQuiz = () => {
    setSelectedQuiz(null);
    setQuizMode('view');
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleSelectAnswer = (questionIndex, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedQuiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-container" style={{ textAlign: 'center' }}>
          <h2 className="quiz-title">Loading quizzes...</h2>
        </div>
      </div>
    );
  }

  // Quiz Taking Mode
  if (selectedQuiz && quizMode === 'take') {
    if (showResults) {
      const score = calculateScore();
      const percentage = (score / selectedQuiz.questions.length * 100).toFixed(1);
      
      return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h1 style={{ color: percentage >= 70 ? '#28a745' : percentage >= 50 ? '#ffc107' : '#dc3545' }}>
              Quiz Results
            </h1>
            <div style={{ fontSize: '48px', margin: '30px 0' }}>
              {score} / {selectedQuiz.questions.length}
            </div>
            <div style={{ fontSize: '24px', marginBottom: '30px' }}>
              {percentage}%
            </div>
            <p style={{ fontSize: '18px', marginBottom: '30px' }}>
              {percentage >= 70 ? '🎉 Excellent!' : percentage >= 50 ? '👍 Good job!' : '📚 Keep practicing!'}
            </p>
            
            <div style={{ marginTop: '30px' }}>
              <h3>Answer Review:</h3>
              {selectedQuiz.questions.map((q, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                
                return (
                  <div key={index} style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
                    borderRadius: '8px',
                    textAlign: 'left'
                  }}>
                    <strong>Q{index + 1}:</strong> {q.question}
                    <div style={{ marginTop: '10px' }}>
                      <div>Your answer: <strong>{userAnswer || 'Not answered'}</strong></div>
                      <div>Correct answer: <strong style={{ color: '#28a745' }}>{q.correctAnswer}</strong></div>
                      {isCorrect ? (
                        <span style={{ color: '#28a745' }}>✓ Correct!</span>
                      ) : (
                        <span style={{ color: '#dc3545' }}>✗ Incorrect</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => handleStartQuiz(selectedQuiz)}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Retake Quiz
              </button>
              <button 
                onClick={handleCloseQuiz}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentQ = selectedQuiz.questions[currentQuestion];
    const totalQuestions = selectedQuiz.questions.length;
    
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={handleCloseQuiz}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Exit Quiz
        </button>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{selectedQuiz.title}</h2>
            <span style={{ fontSize: '18px', color: '#666' }}>
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px',
            marginBottom: '30px'
          }}>
            <div style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: '4px',
              transition: 'width 0.3s'
            }}></div>
          </div>

          {/* Question */}
          <h3 style={{ marginBottom: '30px', fontSize: '20px' }}>
            {currentQ.question}
          </h3>

          {/* Options */}
          <div style={{ marginBottom: '30px' }}>
            {currentQ.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswers[currentQuestion] === letter;
              
              return (
                <div 
                  key={index}
                  onClick={() => handleSelectAnswer(currentQuestion, letter)}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: isSelected ? '#2196F3' : '#f8f9fa',
                    color: isSelected ? 'white' : 'black',
                    border: isSelected ? '2px solid #2196F3' : '2px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <strong style={{ minWidth: '30px' }}>{letter}.</strong>
                  <span>{option}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: currentQuestion === 0 ? '#ccc' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>

            <div style={{ fontSize: '14px', color: '#666' }}>
              {Object.keys(selectedAnswers).length} of {totalQuestions} answered
            </div>

            {currentQuestion === totalQuestions - 1 ? (
              <button 
                onClick={handleSubmitQuiz}
                style={{
                  padding: '10px 30px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Submit Quiz
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz View Mode
  if (selectedQuiz && quizMode === 'view') {
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={handleCloseQuiz}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to All Quizzes
        </button>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1>{selectedQuiz.title}</h1>
          <p style={{ color: '#666', marginBottom: '10px' }}>{selectedQuiz.description}</p>
          <p style={{ marginBottom: '20px' }}>
            <strong>Total Questions:</strong> {selectedQuiz.totalQuestions}
          </p>

          {selectedQuiz.questions.map((q, index) => (
            <div key={index} style={{ 
              marginTop: '30px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <h3 style={{ marginBottom: '15px' }}>
                Question {index + 1}: {q.question}
              </h3>
              
              <div style={{ marginLeft: '20px', marginTop: '15px' }}>
                {q.options.map((option, optIndex) => {
                  const letter = String.fromCharCode(65 + optIndex);
                  const isCorrect = q.correctAnswer === letter;
                  
                  return (
                    <div 
                      key={optIndex} 
                      style={{ 
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: isCorrect ? '#d4edda' : '#fff',
                        border: isCorrect ? '2px solid #28a745' : '1px solid #ddd',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <strong style={{ minWidth: '30px' }}>{letter}.</strong>
                      <span>{option}</span>
                      {isCorrect && (
                        <span style={{ 
                          marginLeft: 'auto',
                          color: '#28a745',
                          fontWeight: 'bold'
                        }}>
                          ✓ Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {q.explanation && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  backgroundColor: '#e7f3ff',
                  borderLeft: '4px solid #2196F3',
                  borderRadius: '4px'
                }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
              
              {q.difficulty && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ 
                    padding: '5px 10px',
                    backgroundColor: q.difficulty === 'easy' ? '#28a745' : q.difficulty === 'medium' ? '#ffc107' : '#dc3545',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {q.difficulty.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <h1 className="quiz-title">My Quizzes</h1>
        <p style={{ color: '#666' }}>
          Welcome back, {user?.username || user?.email}! Here are all your generated quizzes.
        </p>
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

      {quizzes.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2>No quizzes yet</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Upload a PDF on the home page to generate your first quiz!
          </p>
          <button 
            onClick={() => navigate('/')}
            style={{
              marginTop: '20px',
              padding: '12px 30px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Home
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {quizzes.map((quiz) => (
            <div 
              key={quiz._id} 
              style={{ 
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>
                {quiz.title}
              </h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                {quiz.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  <strong>{quiz.totalQuestions}</strong> Questions
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleStartQuiz(quiz)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Start Quiz
                </button>
                <button 
                  onClick={() => handleViewQuiz(quiz)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  View Answers
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quiz;
