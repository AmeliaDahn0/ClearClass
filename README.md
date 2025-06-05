# Student Dashboard

A dashboard application for tracking student progress across different learning platforms.

## Project Structure

```
dash/
├── src/
│   ├── api/              # Backend API
│   ├── components/       # React components
│   ├── services/         # API services
│   ├── types/           # TypeScript types
│   └── scrapers/        # Data scrapers
├── public/              # Static files
└── data/               # Data files
```

## Setup

1. Install backend dependencies:
```bash
cd src/api
pip install -r requirements.txt
```

2. Install frontend dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

1. Start the backend API:
```bash
cd src/api
python app.py
```

2. Start the frontend development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Data Flow

1. The scrapers collect data from various learning platforms and store it in the SQLite database
2. The database exports the latest data to JSON files in the `public/data` directory
3. The backend API serves this data to the frontend
4. The frontend displays the data in a user-friendly dashboard

## Development

- Backend API: Flask with CORS support
- Frontend: React with TypeScript
- Database: SQLite
- Data Scraping: Playwright for browser automation 