# Sinatra API

## Overview
The Sinatra API is the backend service for the **[Sinatra web application](https://github.com/polysharp/sinatra-app)**. It serves as a Back-for-Front (BFF) layer, enabling users to analyze and track the evolution of their websites by leveraging Google's Lighthouse API for in-depth performance metrics. This API is designed to manage and store site analyses efficiently, ensuring seamless integration with the Sinatra web app.

---

## Technologies Used

- **Bun.js** - A fast, modern JavaScript runtime.
- **Elysia.js** - Lightweight and performant framework for building APIs.
- **Drizzle ORM** - Type-safe and powerful ORM for database interactions.
- **Supabase** - PostgreSQL database hosted with additional edge functions for improved scalability.

---

## Features

- Manage and store site analyses, including metrics for performance, accessibility, best practices, and SEO.
- Integration with Google's Lighthouse API for retrieving site insights.
- Flexible filtering options to retrieve analysis data based on criteria like date ranges and status.
- REST API endpoints for easy integration and automation.

---

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/polysharp/sinatra-api
   cd sinatra-api
   ```

2. **Install Dependencies:**
   ```bash
   bun install
   ```

3. **Set Up Local Database (Optional):**
   Use the provided Docker Compose file to set up a PostgreSQL database locally:
   ```bash
   docker-compose up -d
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the root directory and specify the required environment variables (see **[.env.example file](https://github.com/polysharp/sinatra-api/blob/main/.env.example)**).

---

## Usage

1. **Development Mode:**
   Start the project locally in development mode:
   ```bash
   bun dev
   ```

2. **Build the Project:**
   Compile the project into a binary executable:
   ```bash
   NODE_ENV=[production|development] bun build
   ```

3. **Run the Compiled Executable:**
   Start the API using the compiled executable:
   ```bash
   NODE_ENV=[production|development] bun start
   ```

---

## REST API Endpoints

Run the project and open this link in your browser: `http://localhost:3000/swagger`

---

## Next Steps

- **Scheduled Automatic Analyses:**
  Implement a scheduler to perform site analyses automatically at regular intervals.

- **Multi-Page Analyses:**
  Extend functionality to analyze multiple pages within a single site.

---

## Contributions

Contributions are welcome! Please submit a pull request or open an issue for any bugs or feature requests.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

