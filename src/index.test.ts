import { extractQuestionPaper } from "./index";
import { QuestionPaper } from "./types";

// Sample HTML content mimicking the structure
const sampleHtml = `
<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body>
  <div class="breadcrumbs-container">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">Dashboard</li>
      <li class="breadcrumb-item">My Courses</li>
      <li class="breadcrumb-item">Test Course</li>
      <li class="breadcrumb-item">Quiz 1 Review</li>
    </ol>
  </div>

  <div class="rui-title-container"><h4>Sample Quiz Review</h4></div>

  <div class="rui-summary-table">
    <div class="rui-infobox rui-infobox--completedon"><h5 class="rui-infobox-title">Completed on</h5><div class="rui-infobox-content--small">Monday, 01 April 2024, 10:00 AM</div></div>
    <div class="rui-infobox rui-infobox--timetaken"><h5 class="rui-infobox-title">Time taken</h5><div class="rui-infobox-content--small">15 mins 30 secs</div></div>
    <div class="rui-infobox rui-infobox--grade"><h5 class="rui-infobox-title">Grade</h5><div class="rui-infobox-content--small"><b>8.50</b> out of 10.00 (<b>85.00</b>%)</div></div>
  </div>

  <div class="que">
    <div class="info">
      <div class="grade">Mark 1.00 out of 1.00</div>
    </div>
    <div class="content">
      <div class="qtext"><p>What is 2 + 2?</p></div>
      <div class="prompt">Select the correct answer.</div>
      <div class="answer">
        <div class="r0"><input type="radio" checked> 3</div>
        <div class="r1"><input type="radio"> 4</div>
      </div>
    </div>
    <div class="outcome">
      <div class="generalfeedback"><p>Basic arithmetic.</p></div>
      <div class="rightanswer"><p>The correct answer is: 4</p></div>
    </div>
  </div>

  <div class="que">
    <div class="info">
      <div class="grade">Mark 0.50 out of 1.00</div>
    </div>
    <div class="content">
      <div class="qtext"><p>Which are primary colors?</p></div>
      <div class="answer">
         <div class="r1"><span>Red</span></div>
         <div class="r0"><span>Green</span></div>
         <div class="r1"><span>Blue</span></div>
      </div>
    </div>
    <div class="outcome">
      <div class="rightanswer"><p>The correct answers are: Red, Blue, Yellow</p></div>
    </div>
  </div>

   <div class="que">
    <div class="info">
      <div class="grade">Mark 0.00 out of 1.00</div>
    </div>
    <div class="content">
      <div class="qtext"><p>What is the capital of France?</p></div>
      <div class="answer">
         <div class="r0"><span>Berlin</span></div>
      </div>
    </div>
    <div class="outcome">
       <div class="generalfeedback"><p>Check a map!</p></div>
      <div class="rightanswer"><p>The correct answer is: Paris</p></div>
    </div>
  </div>

</body>
</html>
`;

describe("extractQuestionPaper", () => {
  let extractedData: QuestionPaper;

  beforeAll(() => {
    // Parse the HTML string once for all tests in this suite
    // In a real browser environment, you might pass `document` directly
    extractedData = extractQuestionPaper(sampleHtml);
  });

  it("should extract the correct title", () => {
    expect(extractedData.title).toBe("Sample Quiz Review");
  });

  it("should extract the correct breadcrumbs", () => {
    expect(extractedData.breadcrumbs).toEqual([
      "Dashboard",
      "My Courses",
      "Test Course",
      "Quiz 1 Review",
    ]);
  });

  it("should extract summary information correctly", () => {
    expect(extractedData.summary.completedOnText).toBe(
      "Monday, 01 April 2024, 10:00 AM"
    );
    expect(extractedData.summary.timeTakenText).toBe("15 mins 30 secs");
    expect(extractedData.summary.gradeText).toBe(
      "<b>8.50</b> out of 10.00 (<b>85.00</b>%)"
    );
    expect(extractedData.summary.gradeScore).toBe(8.5);
    expect(extractedData.summary.gradeTotal).toBe(10.0);
    expect(extractedData.summary.gradePercentage).toBe(85.0);
  });

  it("should extract the correct number of questions", () => {
    expect(extractedData.questions).toHaveLength(3);
  });

  it("should extract details for the first question correctly", () => {
    const firstQuestion = extractedData.questions[0];
    expect(firstQuestion.info.gradeText).toBe("Mark 1.00 out of 1.00");
    expect(firstQuestion.info.markAchieved).toBe(1.0);
    expect(firstQuestion.info.markTotal).toBe(1.0);
    expect(firstQuestion.content.questionTextHtml).toBe(
      "<p>What is 2 + 2?</p>"
    );
    expect(firstQuestion.content.promptHtml).toBe("Select the correct answer.");
    expect(firstQuestion.content.userAnswers).toHaveLength(2);
    expect(firstQuestion.content.userAnswers[0].isCorrect).toBe(false);
    expect(firstQuestion.content.userAnswers[1].isCorrect).toBe(true);
    expect(firstQuestion.outcome.generalFeedbackHtml).toBe(
      "<p>Basic arithmetic.</p>"
    );
    expect(firstQuestion.outcome.correctAnswerHtml).toBe(
      "<p>The correct answer is: 4</p>"
    );
    expect(firstQuestion.state).toBe("Correct");
  });

  it("should extract details for the second (partially correct) question correctly", () => {
    const secondQuestion = extractedData.questions[1];
    expect(secondQuestion.info.markAchieved).toBe(0.5);
    expect(secondQuestion.info.markTotal).toBe(1.0);
    expect(secondQuestion.content.userAnswers).toHaveLength(3);
    expect(secondQuestion.content.userAnswers[0].isCorrect).toBe(true); // Red
    expect(secondQuestion.content.userAnswers[1].isCorrect).toBe(false); // Green
    expect(secondQuestion.content.userAnswers[2].isCorrect).toBe(true); // Blue
    expect(secondQuestion.outcome.generalFeedbackHtml).toBeNull(); // No general feedback provided in sample
    expect(secondQuestion.outcome.correctAnswerHtml).toBe(
      "<p>The correct answers are: Red, Blue, Yellow</p>"
    );
    expect(secondQuestion.state).toBe("Partially Correct");
  });

  it("should extract details for the third (incorrect) question correctly", () => {
    const thirdQuestion = extractedData.questions[2];
    expect(thirdQuestion.info.markAchieved).toBe(0.0);
    expect(thirdQuestion.info.markTotal).toBe(1.0);
    expect(thirdQuestion.content.userAnswers).toHaveLength(1);
    expect(thirdQuestion.content.userAnswers[0].isCorrect).toBe(false); // Berlin
    expect(thirdQuestion.outcome.generalFeedbackHtml).toBe(
      "<p>Check a map!</p>"
    );
    expect(thirdQuestion.outcome.correctAnswerHtml).toBe(
      "<p>The correct answer is: Paris</p>"
    );
    expect(thirdQuestion.state).toBe("Incorrect");
  });
});
