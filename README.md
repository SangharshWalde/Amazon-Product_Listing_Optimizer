# Amazon Listing Optimization App - SalesDuo Intern Assignment

A full-stack application that leverages AI to optimize Amazon product listings based on ASIN.

## Features
- Amazon product data fetching via ASIN
- AI-powered listing optimization using OpenAI API
- Side-by-side comparison of original and optimized content
- Optimization history tracking and viewing
- Responsive and intuitive UI

## Tech Stack

### Frontend
- React.js
- Material-UI for components
- Axios for API requests

### Backend
- Node.js with Express
- MySQL for database
- Cheerio/Puppeteer for web scraping
- OpenAI API integration

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL
- OpenAI API key

### Installation

1. Clone the repository
```
git clone <repository-url>
cd AmazonLISTINGAppR
```

2. Install dependencies for backend
```
cd backend
npm install
```

3. Install dependencies for frontend
```
cd ../frontend
npm install
```

4. Set up MySQL database
```
# Run the SQL script in the database/schema.sql file to create the necessary tables
```

5. Create a .env file in the backend directory with the following variables
```
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=amazon_listing_app
OPENAI_API_KEY=your_openai_api_key
```

6. Start the backend server
```
cd backend
npm run dev
```

7. Start the frontend development server
```
cd frontend
npm start
```

8. Access the application at http://localhost:3000

## Project Structure

```
AmazonLISTINGAppR/
├── backend/             # Backend server code
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── database/            # Database scripts
│   └── schema.sql       # MySQL schema
├── frontend/            # Frontend React application
│   ├── public/          # Static files
│   ├── src/             # React source code
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   ├── App.js       # Main component
│   │   └── index.js     # Entry point
│   └── package.json     # Dependencies
└── README.md            # Project documentation
```

## AI Prompt Engineering

The application uses carefully crafted prompts to generate optimized Amazon listings. Here's the reasoning behind our prompt design:

1. **Title Optimization Prompt**:
   - Maintains Amazon's character limits
   - Emphasizes keyword inclusion while keeping readability
   - Avoids keyword stuffing; uses natural language

2. **Bullet Points Optimization Prompt**:
   - Highlights key benefits followed by supporting features
   - Keeps bullets concise and compliant with Amazon guidelines
   - Ensures consistent tone and structure

3. **Description Optimization Prompt**:
   - Persuasive yet compliant wording (no prohibited claims)
   - Clear paragraph structure for readability
   - Focuses on unique selling points

4. **Keyword Suggestion Prompt**:
   - Analyzes category and existing content
   - Finds gaps in keyword coverage
   - Suggests relevant long‑tail keywords for discoverability

## Challenges and Design Decisions

1. **Amazon Data Scraping**:
   - Rotating user agents and polite waits to reduce blocking
   - Multiple selectors and fallbacks when elements are missing

2. **AI Response Formatting**:
   - Prompts designed to return structured JSON-like outputs
   - Validation and cleanup to ensure usable content

3. **Optimization History**:
   - Database schema supports multiple optimization versions per product
   - Comparison view to visualize improvements over time