# Membean Scraper

A tool to scrape Membean data using Playwright.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Playwright browsers:
```bash
playwright install
```

3. Create a `.env` file with your credentials:
```bash
cp .env.example .env
```

4. Edit the `.env` file and add your Membean username and password.

## Usage

Run the scraper:
```bash
python membean_scraper.py
```

The script will:
1. Launch a browser window
2. Navigate to Membean login page
3. Log in using your credentials
4. Keep the browser open for inspection
5. Close when you press Enter

## Security Note

- Never commit your `.env` file to version control
- Keep your credentials secure
- This tool should only be used with proper authorization 