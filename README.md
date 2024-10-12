# Pile Up Backend

This is the backend repository for the "Pile Up" React Native Android app.  
The app helps users manage money they have lent to others and split expenses during group activities (e.g., trips, events).

---

## Features

- User authentication using OTP.
- Manage contacts and transactions between users.
- Create transactions (request/payback money).
- Handle multiple transactions between users.
- Manage user profile and set names.
- Delete contacts and transactions.

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- dotenv for environment variables

---

## API Endpoints

### Authentication Routes

- `POST /request-otp`  
  Request an OTP for user authentication.

- `POST /verify-otp`  
  Verify the OTP and authenticate the user.

---

### User Routes

- `POST /set-name`  
  Set the name of the authenticated user.

- `GET /contacts`  
  Get all contacts of the authenticated user.

- `DELETE /contacts/:contactId`  
  Delete a contact from the authenticated user's contact list.

- `GET /contacts/transactions/:contactId/:transactionId?`  
  Get transactions for a specific contact. If a `transactionId` is provided, get the new transactions since the last transaction with that contact.

---

### Transaction Routes

- `POST /`  
  Create a new transaction (either request or payback).

- `DELETE /:transactionId`  
  Delete an existing transaction.

---

## Models

### User Model

- `name`: Name of the user.
- `number`: User's phone number.
- `otp`: OTP code for authentication.
- `netBalance`: User's current net balance.
- `contacts`: A list of the user's contacts with contact IDs, balances, and transactions.
- `transactions`: User's list of transactions (not directly linked but handled via contacts).

### Transaction Model

- `senderId`: ID of the user sending the money.
- `recieverId`: ID of the user receiving the money.
- `amount`: Amount of money involved in the transaction.
- `date`: Date of transaction.
- `description`: Description of the transaction.
- `transactionType`: Type of transaction ('request' or 'payback').
- `isApproved`: Boolean indicating whether the transaction has been approved.

---

## Middleware

### authMiddleware

- Handles user authentication using JWT.
- Verifies the `sessionToken` in the request headers.
- Adds authenticated user to `req.user`.

---

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ciphrox/pile-up-backend
   ```

2. Navigate to the project directory:

    ```bash
    cd pile-up-backend
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Create a `.env` file in the root of the project and add the following environment variables:

    - `JWT_SECRET`: Secret key for JWT token generation. You can generate a secret key using the following bash command:

      ```bash
      openssl rand -base64 32
      ```

   - `MONGO_URI`: MongoDB connection URI.

5. Start the backend server:

    ```bash
    npm start
    ```

## Usage

- The backend API can be used by the React Native mobile app to handle all transactions and user management features.
- Authentication is handled via OTP, and users can interact with their contacts and manage payments and requests through the API.

## Contributing

Feel free to contribute to the project by opening an issue or submitting a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- MongoDB for the database.
- Express.js for the web framework.
- JWT for authentication and security.

---

> If you have any questions or issues, feel free to contact the maintainers or open an issue in the repository.
