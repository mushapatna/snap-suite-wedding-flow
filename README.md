# EVENTPIXIO
A Wedding Photography and Videography Agency Management Tool

A comprehensive Wedding Project Management System designed to streamline the workflow for photographers, videographers, and editors.

## Features

-   **Role-Based Access Control**: Tailored dashboards for Admin, Project Managers, Photographers, Cinematographers, and Editors.
-   **Project Management**: Create and track wedding projects with detailed event timelines.
-   **Team Collaboration**: Invite team members, assign tasks, and track progress.
-   **Task & Checklist System**: Dynamic checklists for events (e.g., equipment prep, shot lists).
-   **File Submission**: Streamlined submission process for raw and edited files.
-   **Client Portal**: (Upcoming) View for clients to track their wedding project status.

## Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Shadcn UI
-   **Backend**: Django REST Framework (Python)
-   **Database**: PostgreSQL
-   **Authentication**: Token-based Authentication (Django Token Auth)

## Setup Instructions

### Prerequisites

-   Node.js & npm
-   Python 3.10+
-   PostgreSQL or Docker

### Backend Setup

1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Create and activate virtual environment:
    ```bash
    python -m venv .venv
    .\.venv\Scripts\activate  # Windows
    # source .venv/bin/activate # Mac/Linux
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run migrations:
    ```bash
    python manage.py migrate
    ```
5.  Start server:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup

1.  Navigate to root:
    ```bash
    cd ..
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start dev server:
    ```bash
    npm run dev
    ```

## License

## License

Private / Proprietary
