/**
 * Represents a single answer part provided by the user within the .answer div.
 */
export interface UserAnswer {
  /** HTML content of the user's answer part. */
  answerHtml: string;
  /** Whether this specific answer part was marked correct (derived from r1 class vs r0). */
  isCorrect: boolean;
}

/**
 * Represents a single extracted question based on the '.que' div structure.
 */
export interface Question {
  /** Information section containing metadata like grade. */
  info: {
    /** Raw text from the grade element (e.g., "Mark 1.00 out of 1.00"). Null if not found. */
    gradeText: string | null;
    /** Optional: Parsed mark achieved by the user. Null if parsing fails or not present. */
    markAchieved?: number | null;
    /** Optional: Parsed total possible marks for the question. Null if parsing fails or not present. */
    markTotal?: number | null;
  };
  /** Content section containing the question text, prompt, and user's answers. */
  content: {
    /** HTML content of the main question text (from .qtext). */
    questionTextHtml: string;
    /** HTML content of the prompt or instructions (from .prompt). Null if not found. */
    promptHtml: string | null;
    /** Array representing the user's submitted answers (from .answer > .r0/.r1). */
    userAnswers: UserAnswer[];
  };
  /** Outcome section containing feedback and the correct answer details. */
  outcome: {
    /** HTML content of the general feedback provided (from .generalfeedback). Null if not found. */
    generalFeedbackHtml: string | null;
    /** HTML content displaying the correct answer(s) (from .rightanswer). Null if not found. */
    correctAnswerHtml: string | null;
  };
  /** Optional: The overall state derived from the grade (e.g., 'Correct', 'Incorrect'). */
  state?: "Correct" | "Partially Correct" | "Incorrect" | "Unknown";
  /** Optional: Original HTML of the entire <div class="que"> element for reference. */
  originalHtml?: string;
}

// Typically, the extractor function would return an array of these Question objects.
export type Questions = Question[];

/**
 * Represents the overall question paper or quiz structure,
 * including metadata and the list of questions.
 */
export interface QuestionPaper {
  /** Array of breadcrumb texts extracted from .breadcrumb > .breadcrumb-item */
  breadcrumbs: string[];

  /** The main title of the quiz/test extracted from .rui-title-container > h[1-4] */
  title: string | null;

  /** Summary information extracted from the .rui-summary-table */
  summary: {
    /** Raw text content of the 'Completed on' infobox. Null if not found. */
    completedOnText: string | null;
    /** Raw text content of the 'Time taken' infobox. Null if not found. */
    timeTakenText: string | null;
    /** Raw text content of the 'Grade' infobox. Null if not found. */
    gradeText: string | null;
    /** Optional: Parsed score from the grade text. Null if parsing fails or not present. */
    gradeScore?: number | null;
    /** Optional: Parsed total possible score from the grade text. Null if parsing fails or not present. */
    gradeTotal?: number | null;
    /** Optional: Parsed percentage from the grade text. Null if parsing fails or not present. */
    gradePercentage?: number | null;
  };

  /** An array containing all the extracted Question objects. */
  questions: Questions;
}
