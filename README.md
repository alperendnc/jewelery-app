# Jeweler Application – Inventory, Sales & Finance Management

This project is a full-featured management system tailored for jewelry businesses. It includes inventory tracking, sales recording, customer management, stock updates, reporting, and finance tracking – all built using **React**, **TypeScript**, **Firebase**, and **Material UI**.

## Features

- **💍 Product Management** – Add, edit, update, and delete products with details like gram, price, and stock.
- **🧾 Sales Tracking** – Record customer sales, calculate totals, and manage transactions.
- **👥 Customer Management** – Register and manage customer details including debts, credits, and contact information.
- **📦 Stock Page** – View and manage current product stock levels.
- **📈 Reporting Page** – Generate reports on sales, stock, and customers (future feature).
- **💸 Finance Tracking** – Track income and expenses with support for different payment methods and summaries.
- **🔐 Firebase Integration** – All data is synced with Firestore in real-time.
- **📱 Responsive UI** – Clean and mobile-friendly design using Material UI components.

---

## Cloning the Repository

To use this project, first clone the repository and pull the latest changes:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd jewelery-app
   ```
3. Pull the latest changes:
   ```bash
   git pull origin <branch-name>
   ```

## Installation

To run this project locally, follow these steps:

1. Navigate to the project directory:
   ```bash
   cd jewelery-app
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
