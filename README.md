# To-Do List Application

This project is a comprehensive and stylish To-Do List application designed to help you manage your tasks, notes, and schedule effectively. Developed using React, it offers a range of features to enhance productivity and organization.

## Features

- **Task Management:** Easily add, edit, complete, and delete tasks to stay organized and on top of your to-do list.
- **Notes Management:** Quickly add, edit, delete, and search notes with the ability to mark favorites for easy access.
- **Calendar Integration:** A dedicated calendar page to view and manage tasks by date, making it easier to track and plan your schedule. Tasks can also be added directly from the calendar.
- **User Authentication:** Sign up and log in with different accounts to personalize your experience and securely manage your data.
- **Responsive Design:** Fully responsive design ensures a seamless experience on both mobile and desktop devices.

## Project Structure

- **`App.tsx`:** The main component of the application. Manages routing and global providers.
- **`TodoList.tsx`:** The component that manages the task list and task-related actions.
- **`NotesPage/page.tsx`:** The page for managing notes with features like adding, editing, and favoriting notes.
- **`CalendarPage/page.tsx`:** The page for calendar-related functionalities, including adding tasks directly from the calendar.
- **`Navbar` and `Sidebar`:** Navigation components for the application.
- **`MaterialUIComponents.tsx`:** Centralized file for importing Material-UI components.
- **`themes/index.tsx`:** Theme configuration for Material-UI.

## Cloning the Repository

To use this project, first clone the repository and pull the latest changes:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd todo-list
   ```
3. Pull the latest changes:
   ```bash
   git pull origin <branch-name>
   ```

## Installation

To run this project locally, follow these steps:

1. Navigate to the project directory:
   ```bash
   cd todo-list
   ```
2. Install dependencies using Yarn:

   ```bash
   yarn install
   ```

## Set up Firebase:

1. Create a new Firebase project on the Firebase Console.
2. Add a new web app to your Firebase project.
3. Copy the Firebase configuration and add it to your project.

## Create a .env.local file in the root directory and add your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Running the Project

1. Start the development server:
   ```bash
   yarn start
   ```

## Build for Production

1. Create a production build:
   ```bash
   yarn build
   ```

## Testing

1. Run tests:
   ```bash
   yarn test
   ```

## Deployment

1. Deploy the application:
   ```bash
   yarn deploy
   ```
