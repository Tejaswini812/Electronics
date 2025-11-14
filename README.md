# Component Search & Data Extraction System

A full-stack web application that searches FindChips for electronic components and extracts key information into an Excel file.

## Features

- 🔍 Search for components by part number (e.g., "LM358", "1N4148W-TP")
- 📊 Extract key data fields including manufacturer, description, pricing, stock, and datasheet links
- 💾 Store extracted data in Excel workbook (Components.xlsx)
- 🔄 Update existing entries or add new ones automatically
- 📱 Beautiful, modern UI with responsive design
- ⚡ Fast search results (< 3 seconds)
- 🛡️ Rate limiting and error handling
- 📄 Terms of Use documentation

## Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: React.js
- **Data Extraction**: Cheerio (HTML parsing)
- **Storage**: Excel via XLSX library
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone or navigate to the project directory:
```bash
cd my-web-project
```

2. Install backend dependencies:
```bash
npm install
```

3. Navigate to frontend directory and install dependencies:
```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Development Mode

1. Start the backend server (from the project root):
```bash
npm start
```

2. In a separate terminal, start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

### Production Build

1. Build the frontend:
```bash
cd frontend
npm run build
cd ..
```

2. Start the server (it will serve the built React app):
```bash
npm start
```

## Usage

1. Open the web application in your browser
2. Enter a component part number in the search field (e.g., "LM358")
3. Click "Search"
4. The system will:
   - Query FindChips for the component
   - Extract key information
   - Save it to Components.xlsx
   - Display the results in the table

## Project Structure

```
my-web-project/
├── server.js              # Backend Express server
├── package.json           # Backend dependencies
├── Components.xlsx        # Generated Excel file (created after first search)
├── frontend/              # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles
│   │   ├── index.js      # Entry point
│   │   └── index.css     # Global styles
│   └── package.json      # Frontend dependencies
└── README.md
```

## API Endpoints

- `POST /api/search` - Search for a component
  - Body: `{ "partNumber": "LM358" }`
  - Response: Component data with success status

- `GET /api/components` - Get all stored components
  - Response: Array of all components

## Rate Limiting

The application implements rate limiting to avoid overwhelming the source website:
- Maximum 30 requests per minute
- Minimum 2 seconds between requests
- Random delays (500-1500ms) to mimic human behavior

## Error Handling

The system handles various error scenarios:
- Part not found
- Network timeouts
- Access denied (403)
- Rate limit exceeded (429)
- Excel save failures

## Terms of Use & Data License

**Important**: This application is for academic use only.

- Data extracted from FindChips is for research and educational purposes
- No redistribution or commercial use without proper authorization
- Respect FindChips terms of service
- Use responsibly and respect rate limits
- The application may be subject to scraping limitations
- For commercial use, consider obtaining an official API license

## Limitations

1. **No Official API**: FindChips does not provide a free public API, so HTML scraping is used
2. **HTML Structure Changes**: The parser may break if FindChips updates their HTML structure
3. **Rate Limits**: Requesting large volumes of data may trigger blocking
4. **Commercial Use**: For production/commercial use, an official integration may be required

## Troubleshooting

**Issue**: "Access denied" error
- Solution: The website may be blocking automated requests. Wait and try again later.

**Issue**: No data extracted
- Solution: The HTML structure may have changed. Check the parser selectors in server.js

**Issue**: Excel file not created
- Solution: Ensure the application has write permissions in the project directory

**Issue**: CORS errors
- Solution: Make sure you're accessing the frontend from the correct URL and that the backend is running

## Contributing

To modify the data extraction logic, edit the `searchFindChips()` function in `server.js`. You may need to update the Cheerio selectors if FindChips changes their HTML structure.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments for implementation details
- Consult FindChips documentation for their terms of service

## Acknowledgments

- Built with Node.js, Express, React
- Uses Cheerio for HTML parsing
- Uses XLSX for Excel file handling
- Searches data from FindChips.com
