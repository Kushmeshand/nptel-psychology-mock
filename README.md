# NPTEL Psychology of Learning — Mock Lab

A Next.js practice site built from `Psychology_2026_merged.pdf` (provided by the user). It contains Week 0 through Week 12, 10 questions per week (130 total), week-wise practice, a timed full-length mock, question palette, mark-for-review, scoring, answer review, and recent-attempt history stored in the browser.

## Run locally

1. Install Node.js 18.17+.
2. Extract this project folder.
3. In a terminal inside the folder run:

   ```bash
   npm install
   npm run dev
   ```

4. Open http://localhost:3000

## Deploy to Vercel

1. Upload this project to a new GitHub repository.
2. In Vercel, choose **Add New → Project**, import the repository, and keep the default Next.js settings.
3. Click **Deploy**. No environment variables are required.
Deployment update
## Notes about the source PDF

- The PDF contains Week 0–12. Its Week 7 heading says “July 2025” while the surrounding assignments are labelled July 2026; the app labels it Week 7 for consistency.
- One answer-line mismatch was detected in Week 6, Question 7: the PDF says “a = all of the given” while “all of the given” is option D. The app uses option D based on the answer text and flags this on the review screen.
- The app uses the provided answer key. Please double-check any source-PDF typos against your official course materials.

## Project structure

- `app/page.jsx` — UI and test logic
- `app/globals.css` — responsive styling
- `data/questions.json` — extracted question bank
