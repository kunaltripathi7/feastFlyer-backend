# FeastFlyer Backend

This is the backend for FeastFlyer, a modern food delivery application. It's built with Node.js, Express, and TypeScript, and it's designed to be scalable, secure, and maintainable.

## Features

*   **RESTful API:** The backend exposes a comprehensive RESTful API for managing users, restaurants, orders, and payments.
*   **Authentication and Authorization:** We use JWTs and the `express-oauth2-jwt-bearer` library to secure our endpoints, ensuring that only authenticated and authorized users can access protected resources.
*   **Database:** We use MongoDB as our primary database, with Mongoose for object data modeling. This provides a flexible and scalable data storage solution.
*   **Payment Processing:** We've integrated Stripe for secure and reliable payment processing, including a webhook for handling asynchronous events.
*   **Image Uploads:** We use Cloudinary for cloud-based image storage and management, with Multer for handling file uploads.
*   **Validation:** We use `express-validator` to validate and sanitize incoming request data, preventing common security vulnerabilities.
*   **TypeScript:** The entire codebase is written in TypeScript, providing static typing and improved developer experience.

## Tech Stack

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express:** A fast, unopinionated, minimalist web framework for Node.js.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **MongoDB:** A cross-platform document-oriented database program.
*   **Mongoose:** An elegant mongodb object modeling for node.js.
*   **Stripe:** A suite of payment APIs that powers commerce for online businesses of all sizes.
*   **Cloudinary:** A cloud-based image and video management solution.
*   **JWT:** JSON Web Tokens are an open, industry standard RFC 7519 method for representing claims securely between two parties.

## Getting Started

### Prerequisites

*   Node.js
*   npm
*   MongoDB
*   Stripe CLI

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/FeastFlyer.git
    ```
2.  Navigate to the backend directory:
    ```bash
    cd FeastFlyer/backend
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env` file in the `backend` directory and add the following environment variables:
    ```
    MONGO_URI=<your_mongo_db_uri>
    JWT_SECRET=<your_jwt_secret>
    STRIPE_API_KEY=<your_stripe_api_key>
    STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```
6.  Start the Stripe webhook forwarding:
    ```bash
    npm run stripe
    ```

The server will be running on `http://localhost:7000`.
