# file_uploader_app# Cloud Storage App

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Introduction

The **Cloud Storage App** is a secure and efficient file storage and sharing platform. Users can upload, manage, and share files in a user-friendly web interface. The app employs strong authentication and secure storage mechanisms to ensure data integrity and privacy.

---

## Features

- ✅ User authentication and authorization with Passport.js and bcrypt.
- 🔒 Secure file storage using cloud integration.
- 🔗 File sharing with user-specific access permissions.
- ⬆️ File upload and ⬇️ download functionality.
- 📱 Responsive and intuitive UI built with modern frameworks.
- 🛠️ PostgreSQL database for reliable data management.
- 🛡️ Role-based access control for enhanced security.

---

## Technologies Used

| **Technology**     | **Description**                       |
| ------------------ | ------------------------------------- |
| **Backend**        | Node.js, Express.js                   |
| **Database**       | PostgreSQL                            |
| **ORM**            | Prisma                                |
| **Authentication** | Passport.js, bcrypt                   |
| **Cloud Storage**  | (Specify provider, e.g., AWS S3, GCS) |
| **Frontend**       | EJS templates, CSS, JavaScript        |

---

## Installation

Follow these steps to set up the app locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/cloud-storage-app.git
   cd cloud-storage-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up the PostgreSQL database:**

   - Create a database named `cfile_uploader_dbe`.
   - Run the Prisma migrations to set up the schema:
     ```bash
     npx prisma migrate dev
     ```

4. **Configure environment variables:**

   - Create a `.env` file in the root directory.
   - Add the required variables (see [Environment Variables](#environment-variables)).

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. **Access the application:**
   Visit `http://localhost:3000` in your browser.

---

## Usage

- **Sign up**: Create an account to access the app.
- **Log in**: Authenticate with your credentials.
- **Upload files**: Use the file upload interface to add files.
- **Manage files**: View, rename, delete, or share files with others.
- **Download files**: Access your stored files securely.

---

## API Endpoints

### Authentication

| **Method** | **Endpoint**   | **Description**                |
| ---------- | -------------- | ------------------------------ |
| `POST`     | `/auth/signup` | Create a new user.             |
| `POST`     | `/auth/login`  | Authenticate an existing user. |
| `POST`     | `/auth/logout` | Log out the current user.      |

### Files

| **Method** | **Endpoint**    | **Description**                  |
| ---------- | --------------- | -------------------------------- |
| `GET`      | `/files`        | Retrieve the list of user files. |
| `POST`     | `/files/upload` | Upload a new file.               |
| `GET`      | `/files/:id`    | Download a specific file.        |
| `DELETE`   | `/files/:id`    | Delete a specific file.          |

### Users

| **Method** | **Endpoint** | **Description**                  |
| ---------- | ------------ | -------------------------------- |
| `GET`      | `/users/:id` | Retrieve user profile details.   |
| `PUT`      | `/users/:id` | Update user profile information. |

---

## Environment Variables

The following environment variables must be configured in the `.env` file:

```env
DATABASE_URL=your_postgresql_connection_string
CLOUD_STORAGE_API_KEY=your_cloud_storage_api_key
SESSION_SECRET=your_session_secret
```

---
