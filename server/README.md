# Server Documentation

## Node.js Express Backend for Portfolio Dashboard

This Express.js server provides APIs for the portfolio dashboard with the following features:

### Features

- **Caching with TTL**: In-memory cache with configurable time-to-live for stock data
- **Rate Limiting**: Prevent API blocks with configurable rate limits
- **Parallel Requests**: Uses Promise.all() for concurrent API calls
- **Retry Logic**: Exponential backoff for failed API requests
- **Error Handling**: Comprehensive error handling with meaningful responses
- **CORS Support**: Secure cross-origin requests from React frontend
- **Stock Data**: Real-time stock data from Yahoo Finance and alternative sources
- **Portfolio Calculations**: Complete portfolio metrics including gain/loss

### API Endpoints

#### Health & Status
- `GET /health` - Health check endpoint

#### Stock Data
- `GET /api/stock-data?symbols=INFY,TCS,RELIANCE` - Fetch stock data with caching
- `POST /api/stock-data/batch` - Batch fetch stock data

#### Holdings
- `GET /api/holdings` - Get all holdings
- `GET /api/holdings/:id` - Get single holding
- `POST /api/holdings` - Add new holding

#### Portfolio
- `GET /api/portfolio` - Get complete portfolio with calculations
- `POST /api/portfolio/refresh` - Refresh portfolio (clear cache)

### Installation

```bash
cd server
npm install
```

### Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

YAHOO_FINANCE_API_TIMEOUT=10000
GOOGLE_FINANCE_API_TIMEOUT=10000

STOCK_DATA_CACHE_TTL=60000
HOLDINGS_CACHE_TTL=300000

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Key Implementation Details

#### 1. Caching System
- Generic cache manager with TTL support
- Automatic expiration of cached data
- Separate cache keys for different data types

#### 2. Rate Limiting
- Express rate limit middleware
- Different limits for different endpoints
- Respects cache to reduce API calls

#### 3. Stock Data Fetching
- Yahoo Finance for current market prices
- BSE India API for P/E ratios
- Google Finance as fallback
- Automatic retry with exponential backoff
- Request deduplication for same symbols

#### 4. Data Enrichment
- Holdings enriched with stock market data
- Calculations for gain/loss and percentages
- Grouped by sectors with summary metrics

### Error Handling

All API responses follow this format:

Success:
```json
{
  "success": true,
  "data": {...},
  "timestamp": 1700000000000
}
```

Error:
```json
{
  "success": false,
  "error": "Error message",
  "details": {...}
}
```

### Security

- CORS headers configured
- Security headers added (X-Content-Type-Options, X-Frame-Options, etc.)
- Rate limiting to prevent abuse
- No sensitive data exposed in client-side code
- API keys kept on server side

### Performance Optimizations

- In-memory caching with TTL
- Request batching and deduplication
- Parallel API calls using Promise.all()
- Minimal data transfer
- React.memo for frontend components to prevent unnecessary re-renders
