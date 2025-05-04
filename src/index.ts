// src/index.ts

import { QuestionPaper, Question, UserAnswer } from "./types";

// Helper function to safely get text content or null
function getText(element: Element | null, selector: string): string | null {
  const target = element?.querySelector(selector);
  return target?.textContent?.trim() || null;
}

// Helper function to safely get inner HTML or null
function getHtml(element: Element | null, selector: string): string | null {
  const target = element?.querySelector(selector);
  return target?.innerHTML?.trim() || null;
}

// Helper function to parse grade strings like "Mark X out of Y"
function parseGrade(gradeText: string | null): {
  achieved: number | null;
  total: number | null;
} {
  const result = { achieved: 0.0, total: 0.0 };
  if (!gradeText) return result;

  // Regex to find numbers like "1.00 out of 1.00" or just "1.00"
  const match =
    gradeText.match(/([0-9.]+)\s*out of\s*([0-9.]+)/i) ||
    gradeText.match(/([0-9.]+)/);
  if (match) {
    result.achieved = parseFloat(match[1]);
    if (match[2]) {
      result.total = parseFloat(match[2]);
    }
  }
  return result;
}

// Helper function to parse summary grade strings like "X out of Y (Z%)"
function parseSummaryGrade(gradeText: string | null): {
  score: number | null;
  total: number | null;
  percentage: number | null;
} {
  const result = { score: 0.0, total: 0.0, percentage: 0.0 };
  if (!gradeText) return result;

  // Regex to find numbers like "32.05 out of 40.00 (80.13%)"
  const scoreMatch = gradeText.match(/<b>([0-9.]+)<\/b>\s*out of\s*([0-9.]+)/i);
  if (scoreMatch) {
    result.score = parseFloat(scoreMatch[1]);
    result.total = parseFloat(scoreMatch[2]);
  }

  const percentageMatch = gradeText.match(/\(<b>([0-9.]+)<\/b>%\)/i);
  if (percentageMatch) {
    result.percentage = parseFloat(percentageMatch[1]);
  }

  return result;
}

/**
 * Extracts data for a single question from its corresponding '.que' element.
 * @param questionElement The DOM element for a single question (<div class="que">).
 * @returns A Question object.
 */
function extractQuestion(questionElement: Element): Question {
  const infoElement = questionElement.querySelector(".info");
  const contentElement = questionElement.querySelector(".content");
  const outcomeElement = questionElement.querySelector(".outcome");

  const gradeText = getText(infoElement, ".grade");
  const { achieved: markAchieved, total: markTotal } = parseGrade(gradeText);

  const userAnswers: UserAnswer[] = [];
  contentElement
    ?.querySelectorAll('.answer > div[class^="r"]')
    ?.forEach((answerEl) => {
      userAnswers.push({
        answerHtml: answerEl.innerHTML.trim(),
        isCorrect: answerEl.classList.contains("r1"), // r1 is correct, r0 is incorrect
      });
    });

  // Determine overall state based on grade (simple example)
  let state: Question["state"] = "Unknown";
  if (markAchieved !== null && markTotal !== null) {
    if (markAchieved === markTotal) {
      state = "Correct";
    } else if (markAchieved > 0) {
      state = "Partially Correct";
    } else {
      state = "Incorrect";
    }
  }

  return {
    info: {
      gradeText: gradeText,
      markAchieved: markAchieved,
      markTotal: markTotal,
    },
    content: {
      questionTextHtml: getHtml(contentElement, ".qtext") ?? "", // Ensure non-null
      promptHtml: getHtml(contentElement, ".prompt"),
      userAnswers: userAnswers,
    },
    outcome: {
      generalFeedbackHtml: getHtml(outcomeElement, ".generalfeedback"),
      // Assuming .rightanswer contains the HTML directly
      correctAnswerHtml: getHtml(outcomeElement, ".rightanswer"),
    },
    state: state,
    originalHtml: questionElement.outerHTML,
  };
}

/**
 * Parses an HTML Document or string and extracts question paper data.
 * @param htmlSource The HTML Document object or the HTML string content.
 * @returns A QuestionPaper object containing the extracted data.
 */
export function extractQuestionPaper(
  htmlSource: Document | string
): QuestionPaper {
  let doc: Document;
  if (typeof htmlSource === "string") {
    const parser = new DOMParser();
    doc = parser.parseFromString(htmlSource, "text/html");
  } else {
    doc = htmlSource;
  }

  const breadcrumbs = Array.from(
    doc.querySelectorAll(".breadcrumbs-container .breadcrumb .breadcrumb-item")
  ).map((el) => el.textContent?.trim() ?? "");

  const title = getText(
    doc.body,
    ".rui-title-container h1, .rui-title-container h2, .rui-title-container h3, .rui-title-container h4"
  );

  const summaryTable = doc.querySelector(".rui-summary-table");
  const completedOnText = getText(
    summaryTable,
    ".rui-infobox--completedon .rui-infobox-content--small"
  );
  const timeTakenText = getText(
    summaryTable,
    ".rui-infobox--timetaken .rui-infobox-content--small"
  );
  const gradeText = getHtml(
    summaryTable,
    ".rui-infobox--grade .rui-infobox-content--small"
  ); // Use getHtml to preserve <b> tags
  const {
    score: gradeScore,
    total: gradeTotal,
    percentage: gradePercentage,
  } = parseSummaryGrade(gradeText);

  const questionElements = doc.querySelectorAll(".que");
  const questions: Question[] =
    Array.from(questionElements).map(extractQuestion);

  return {
    breadcrumbs: breadcrumbs,
    title: title,
    summary: {
      completedOnText: completedOnText,
      timeTakenText: timeTakenText,
      gradeText: gradeText, // Store the raw HTML here
      gradeScore: gradeScore,
      gradeTotal: gradeTotal,
      gradePercentage: gradePercentage,
    },
    questions: questions,
  };
}
