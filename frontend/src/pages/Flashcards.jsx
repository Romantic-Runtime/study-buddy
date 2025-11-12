import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "../features/authSlice";
import axios from "axios";
import "./Flashcards.css";

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [file, setFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  useEffect(() => {
    if (token) {
      fetchFlashcards();
    }
  }, [token]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/flashcard/my-flashcards', {
        withCredentials: true
      });
      if (response.data.success) {
        setFlashcards(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!token) {
      setError('Please login to generate flashcards');
      navigate('/login');
      return;
    }

    setFile(selectedFile);
    setGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await axios.post(
        "http://localhost:3000/api/pdf/getData",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (uploadResponse.data.success) {
        const flashcardResponse = await axios.post(
          'http://localhost:3000/api/flashcard/generate',
          {
            text: uploadResponse.data.data.text,
            title: `Flashcards from ${selectedFile.name}`
          },
          {
            withCredentials: true
          }
        );

        if (flashcardResponse.data.success) {
          setFlashcards([flashcardResponse.data.data, ...flashcards]);
          setCurrentIndex(0);
          alert('Flashcards generated successfully!');
        }
      }
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError(err.response?.data?.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (flashcards.length > 0 && flashcards[0].cards) {
      setCurrentIndex((prev) => (prev + 1) % flashcards[0].cards.length);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (flashcards.length > 0 && flashcards[0].cards) {
      setCurrentIndex((prev) => (prev - 1 + flashcards[0].cards.length) % flashcards[0].cards.length);
      setIsFlipped(false);
    }
  };

  const currentCard = flashcards.length > 0 && flashcards[0].cards ? flashcards[0].cards[currentIndex] : null;

  return (
    <div className="flashcards-page">
      <div className="flashcards-container">
        <h1 className="flashcards-title">📚 Flashcard Generator</h1>
        <p className="flashcards-subtitle">Generate interactive flashcards for quick revision</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="upload-section">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="flashcard-file-input"
          />
          <label htmlFor="flashcard-file-input" className="upload-button">
            {generating ? '⏳ Generating Flashcards...' : '📤 Upload PDF to Generate Flashcards'}
          </label>
        </div>

        {loading ? (
          <div className="loading">Loading your flashcards...</div>
        ) : flashcards.length > 0 && currentCard ? (
          <div className="flashcard-viewer">
            <div 
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <div className="card-label">Question</div>
                  <p className="card-content">{currentCard.question}</p>
                  <div className="flip-hint">👆 Click to flip</div>
                </div>
                <div className="flashcard-back">
                  <div className="card-label">Answer</div>
                  <p className="card-content">{currentCard.answer}</p>
                  <div className="flip-hint">👆 Click to flip back</div>
                </div>
              </div>
            </div>

            <div className="flashcard-controls">
              <button onClick={handlePrevious} className="control-button">
                ← Previous
              </button>
              <span className="card-counter">
                {currentIndex + 1} / {flashcards[0].cards.length}
              </span>
              <button onClick={handleNext} className="control-button">
                Next →
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No flashcards yet. Upload a PDF to get started!</p>
          </div>
        )}

        {flashcards.length > 0 && (
          <div className="flashcard-sets">
            <h2>Your Flashcard Sets</h2>
            <div className="sets-grid">
              {flashcards.map((set, index) => (
                <div key={set._id} className="set-card">
                  <h3>{set.title}</h3>
                  <p>{set.cards?.length || 0} cards</p>
                  <p className="set-date">
                    {new Date(set.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
