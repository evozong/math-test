-- Ins 1 --
Build a math test site:
- User starts on the main page. User can choose from pre-built test sets. Starting test sets are "Addition to 10hoose from different test sets. Starting test sets are "Addition to 20", "Subtraction to 20", "Multiplication to 9".
- User can also create a custom test set that combines questions from one or more question settings. Allowed settings are "Addition to 20", "Subtraction to 20", "Multiplication to 9".
- Once selected, user goes to the test page. Display a countdown timer starting from 3s, and when countdown finishes, the test starts.
- A test is 10 questions.
- Each question consists of 2 numbers and an operand.
	- For "Addition to 20", each number should be a random number in the range 0 to 9 inclusive, and the operand must be +.
	- For "Subtraction to 20", each number should be a random number in the range 0 to 20 inclusive, the second number must be smaller than or equal to the first number, and the operand must be -.
	- For "Multiplication to 9", each number should be a random number in the range 1 to 9 inclusive.
- Provide a number textbox for user to input the answer.
- User can submit the answer by pressing the "Enter" key or clicking on a "Submit" button
- Mark the answer. If correct, show a big green "O" over the page for 0.5s, then move to the next question. If wrong, show a big red "X" over the page for 1s, then move on to the next question.
- Show a stopwatch on the top-right of the test that shows the time elapsed since test started. Stopwatch should update every second.
- When test finishes, stop the stopwatch and navigate to the results page.
- The results page will show:
	- User's score
	- Time user took
	- A review section that shows the questions, the user's answer, and if the user's answer was wrong, show the correct answer.
- Provide buttons for user to "Try again", or "Choose a new test".
	- "Try again" will bring the user to the test page and start a new game with the same test set settings, but a new set of questions.
	- "Choose a new test" will bring the user to the main page.
- Make the UI light-theme with a yellow-based palette.

-- Ins 2 --
The cursor should focus on the textbox every time the question appears.

-- Ins 3 --
- On the results page, show time elapsed down to milliseconds.
- Change the delay of the "correct" overlay to 300ms
- The overlay should show up over the question box

