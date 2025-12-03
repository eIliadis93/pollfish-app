# Pollfish-App

A dynamic questionnaire management app built with **Angular standalone components** and **Angular CDK** for drag-and-drop functionality.
This project allows users to create, edit, reorder, and delete questions and their answers with real-time autosave.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Development Notes](#development-notes)
- [Project Highlights](#project-highlights)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

- Create, edit, and delete questions
- Add multiple answers per question
- Drag & drop to reorder questions and answers
- Autosave on every change (with debouncing)
- Validation to ensure each question has at least 2 non-empty answers
- Mobile-friendly responsive design
- Smooth animations for dialogs and panels

---

## Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9
- Angular CLI (optional, for running Angular commands locally)

```bash
npm install -g @angular/cli
```

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/eIliadis93/pollfish-app.git
cd pollfish-app
```

2. Install dependencies:

```bash
npm install
```

---

## Running the App

Start the development server:

```bash
ng serve
```

Open your browser and go to: `http://localhost:4200`

The app supports **hot-reloading**, so changes are applied instantly.

---

## Development Notes

- **Standalone Components:** All components are standalone to simplify module management.
- **Signals & Reactive Forms:** The app uses Angular **signals** for state management and reactive forms for handling inputs.
- **Drag & Drop:** Angular CDK is used for reordering both questions and answers.
- **Autosave:** Changes to questions and answers are autosaved with a debounce of 400ms.
- **Validation:** Each question requires at least 2 answers; empty answers are not allowed.

---

## Project Highlights

- **Clean Architecture:**
  Separation of concerns with `QuestionnaireStore` for state and `PollfishApiService` for backend interactions.

- **Reactivity with Signals:**
  Uses Angular signals to manage the state of questions, expanded panels, and saving indicators.

- **User Experience:**

  - Answers auto-focus on new inputs
  - Drag handles for answers and questions
  - Smooth mobile-friendly dialogs and panel animations

- **Autosave Queue Handling:**
  Multiple changes in quick succession are queued and saved sequentially.

- **Toaster:**
  A universal toaster to notify the user for messages, errors, etc.

---

## Future Improvements

- Add unit tests for store and components
- Keyboard accessibility for drag & drop

---

## Backend

For more informations on the mock-api please follow the link:
https://github.com/pollfish/hiring-process/tree/master/mock-api
