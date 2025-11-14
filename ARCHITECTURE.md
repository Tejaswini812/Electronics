# Architecture Documentation

## Overview

This is a full-stack web application that scrapes component data from FindChips and stores it in an Excel file.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                         Client                          │
│                    (React Frontend)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Search Form → Search Button                    │   │
│  │  Results Table ← Component Data                 │   │
│  │  Error/Success Messages                         │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (REST API)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Server                       │
│              (Node.js + Express)                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  API Endpoints:                                  │   │
│  │  - POST /api/search                             │   │
│  │  - GET /api/components                          │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Rate Limiting & Request Management             │   │
│  └─────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌────────────────────────────┐
│   FindChips.com      │    │   Excel Storage            │
│   (External API)     │    │   Components.xlsx          │
│                      │    │                            │
│  - HTML Scraping     │    │  - Read existing data      │
│  - Data Extraction   │    │  - Add new components      │
│  - Parsing (Cheerio) │    │  - Update existing         │
└──────────────────────┘    └────────────────────────────┘
```

## Data Flow

### Search Flow

1. **User Input**: User enters part number in React form
2. **API Request**: Frontend sends POST request to `/api/search`
3. **Rate Limit Check**: Backend checks if request is within rate limits
4. **FindChips Query**: Backend requests FindChips URL with proper headers
5. **HTML Parsing**: Cheerio parses HTML and extracts component data
6. **Excel Update**: Component data saved/updated in Components.xlsx
7. **Response**: Backend returns data to frontend
8. **Display**: Frontend displays data in table

### Display Flow

1. **Page Load**: React app requests `/api/components`
2. **Excel Read**: Backend reads Components.xlsx
3. **JSON Response**: Backend returns all components as JSON
4. **Table Display**: Frontend renders data in table

## Key Components

### Backend (server.js)

- **Express Server**: Handles HTTP requests
- **CORS Middleware**: Allows cross-origin requests
- **Axios**: HTTP client for fetching FindChips pages
- **Cheerio**: HTML parsing and data extraction
- **XLSX**: Excel file read/write operations
- **Rate Limiting**: Prevents overwhelming FindChips

### Frontend (React)

- **App.js**: Main component with search form and results table
- **Axios**: HTTP client for API requests
- **State Management**: React hooks (useState, useEffect)
- **Error Handling**: User-friendly error messages

## Data Structures

### Component Object

```javascript
{
  partNumber: string,      // e.g., "LM358"
  manufacturer: string,    // e.g., "Texas Instruments"
  description: string,     // Component description
  lowestPrice: string,     // e.g., "$0.50"
  availableStock: string,  // Stock quantity
  distributor: string,     // Distributor name
  datasheetLink: string,   // URL to datasheet
  searchUrl: string        // FindChips search URL
}
```

## Security & Ethics

### Rate Limiting Strategy

- **Maximum**: 30 requests per minute
- **Minimum Interval**: 2 seconds between requests
- **Random Delay**: 500-1500ms to mimic human behavior

### Headers Used

- Realistic User-Agent string
- Standard browser headers
- No suspicious patterns

### Ethical Considerations

- For academic use only
- Respects FindChips rate limits
- Includes Terms of Use documentation
- No data redistribution

## Error Handling

### Backend Errors

- Network timeouts (10 seconds)
- 403 Forbidden (access denied)
- 429 Too Many Requests (rate limited)
- Excel save failures

### Frontend Errors

- Empty part number validation
- API request failures
- Network connectivity issues
- Timeout handling

## Scalability Considerations

### Current Limitations

- Single Excel file storage
- In-memory rate limiting
- No database (file-based only)

### Potential Improvements

- Migrate to SQLite/PostgreSQL
- Implement Redis for rate limiting
- Add caching layer
- Support multiple Excel files
- Add user authentication

## Development Tools

- **Node.js**: Runtime environment
- **npm**: Package manager
- **React**: Frontend framework
- **React Scripts**: Build tool
- **Axios**: HTTP client
- **Cheerio**: HTML parser
- **XLSX**: Excel library

## Deployment Considerations

### Production Checklist

- [ ] Set environment variables
- [ ] Build React frontend (`npm run build`)
- [ ] Configure CORS origins
- [ ] Set up HTTPS
- [ ] Configure proper logging
- [ ] Set up monitoring
- [ ] Implement proper error tracking
- [ ] Set up backup for Excel file

### Environment Variables

- `PORT`: Server port (default: 3001)
- `REACT_APP_API_URL`: Frontend API URL
- `NODE_ENV`: Environment (development/production)

## Maintenance

### Updating Parser

If FindChips changes their HTML structure:

1. Inspect FindChips page source
2. Update Cheerio selectors in `searchFindChips()` function
3. Test with various component numbers
4. Update documentation

### Monitoring

- Check server logs for errors
- Monitor rate limit violations
- Track Excel file size
- Monitor response times
