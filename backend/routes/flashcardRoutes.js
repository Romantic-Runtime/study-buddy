const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { generateFlashcards, getMyFlashcards } = require("../controllers/flashcard.controller");

router.post("/generate", auth, generateFlashcards);
router.get("/my-flashcards", auth, getMyFlashcards);

module.exports = router;
