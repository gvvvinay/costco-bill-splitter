# Costco Bill Splitter

A full-stack web application for splitting Costco receipts between friends. Upload a receipt photo, add participants, assign items, and automatically calculate who owes what.

## Features

- 📸 **Receipt Upload & OCR**: Take a photo or upload a receipt image with OCR parsing (Tesseract.js)
- ✏️ **Manual Entry**: Enter items manually with a sample data loader
- 👥 **Participant Management**: Add friends to split bills with
- 🏷️ **Item Assignment**: Assign items to one or multiple participants with an intuitive chip-based UI
- 💰 **Automatic Calculation**: Proportional tax distribution and per-person totals
- 📱 **Mobile-First Design**: Responsive layout optimized for Android browsers
- 🔐 **Simple Authentication**: Email/username-based auth

## Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **Prisma** ORM with **SQLite**
- **Tesseract.js** for OCR
- **JWT** authentication
- **bcrypt** for password hashing

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development
- **React Router** for navigation
- **Axios** for API calls
- Mobile-first CSS

## Project Structure

```
costco-bill-splitter/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   └── src/
│       ├── index.ts               # Express server
│       ├── middleware/
│       │   ├── auth.ts           # JWT authentication
│       │   └── errorHandler.ts   # Error handling
│       ├── routes/
│       │   ├── auth.ts           # Login/register
│       │   ├── sessions.ts       # Bill split sessions
│       │   └── receipts.ts       # Receipt upload & parsing
│       ├── services/
│       │   └── receiptParser.ts  # OCR & Costco receipt parsing
│       └── seed.ts               # Sample data seeder
├── frontend/
│   └── src/
│       ├── components/           # React components
│       ├── contexts/             # Auth context
│       ├── lib/                  # API client
│       ├── pages/                # Route pages
│       └── types/                # TypeScript types
└── package.json                  # Root package for scripts
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd costco-bill-splitter
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup the database**
   ```bash
   npm run db:setup
   ```
   This will:
   - Generate Prisma client
   - Run database migrations
   - Create the SQLite database

4. **Seed sample data (optional)**
   ```bash
   npm run db:seed
   ```
   This creates a test user and sample session with data.

5. **Start the application**
   ```bash
   npm run dev
   ```
   This starts both backend (port 3001) and frontend (port 3000) concurrently.

6. **Open your browser**
   - Navigate to `http://localhost:3000`
   - If you seeded data, login with:
     - **Username**: `testuser`
     - **Password**: `password123`

## Usage

### Creating a New Bill Split

1. **Sign Up / Sign In**
   - Create an account or use the test credentials

2. **Create New Session**
   - Click "+ New Split" on the dashboard
   - Give it a name (e.g., "Weekend Costco Run")

3. **Upload Receipt**
   - Take a photo or upload an image (OCR will parse it)
   - OR use "Enter Manually" and click "Load Sample" for testing

4. **Add Participants**
   - Click "+ Add" in the Participants section
   - Add each friend who's splitting the bill

5. **Assign Items**
   - Tap participant chips to assign items
   - Use "Select All" to assign an item to everyone
   - Filter "Unassigned" to see items that need assignment

6. **View Summary**
   - Switch to the "Summary" tab
   - See per-person breakdown with itemized lists
   - View subtotals, tax shares, and final amounts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in

### Sessions
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Create new session
- `POST /api/sessions/:id/participants` - Add participant
- `PUT /api/sessions/:sessionId/items/:itemId` - Update line item
- `DELETE /api/sessions/:sessionId/items/:itemId` - Delete line item
- `POST /api/sessions/:sessionId/items/:itemId/assign` - Assign participants to item
- `GET /api/sessions/:id/calculate` - Calculate split

### Receipts
- `POST /api/receipts/upload/:sessionId` - Upload and parse receipt (OCR)
- `POST /api/receipts/manual/:sessionId` - Manually enter receipt data

## Development

### Run Backend Only
```bash
npm run dev:backend
```

### Run Frontend Only
```bash
npm run dev:frontend
```

### Build for Production
```bash
npm run build
```

### Database Commands
```bash
cd backend

# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio
```

## Configuration

### Backend Environment Variables
Edit `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
UPLOAD_DIR="./uploads"
```

### Frontend API Proxy
The frontend is configured to proxy `/api` requests to `http://localhost:3001` in development (see `frontend/vite.config.ts`).

## Testing the Application

### Quick Test (Using Sample Data)

1. Start the app: `npm run dev`
2. Login with test credentials
3. Click on "Sample Costco Trip" session
4. See pre-populated items and participants
5. Toggle assignments and view the split calculation

### Manual Entry Test

1. Create a new session
2. Click "Enter Manually"
3. Click "Load Sample" to populate test data
4. Add participants (Alice, Bob, Charlie)
5. Assign items and check the summary

## Splitting Logic

- **Equal Split**: When multiple people are assigned to an item, the price is divided equally
- **Proportional Tax**: Tax is distributed based on each person's share of taxable items
- **Rounding**: All amounts are rounded to 2 decimal places; any rounding error is displayed in the summary

## Known Limitations (v1)

- **OCR Accuracy**: Tesseract.js parsing may not be perfect for all receipt formats. Use manual mode as fallback.
- **Single Receipt per Session**: Each session supports one receipt upload
- **No Edit History**: No undo/redo functionality
- **Local Storage Only**: SQLite database is stored locally
- **No Payment Integration**: Manual payment tracking only

## Follow-Up Tasks & Future Enhancements

### High Priority
- [ ] **Improved OCR**: Train custom model or use cloud OCR (Google Vision API, AWS Textract)
- [ ] **Receipt Photo Gallery**: Store and display receipt images
- [ ] **Edit Item Details**: Allow editing item names, prices, quantities after upload
- [ ] **Delete Participants**: Allow removing participants
- [ ] **Session Deletion**: Add ability to delete entire sessions

### Authentication & Security
- [ ] **OAuth Integration**: Add Google/Facebook login
- [ ] **Password Reset**: Email-based password recovery
- [ ] **Email Verification**: Verify email addresses
- [ ] **HTTPS**: SSL/TLS for production
- [ ] **Rate Limiting**: Prevent API abuse

### User Experience
- [ ] **Progressive Web App (PWA)**: Installable mobile app
- [ ] **Offline Support**: Service workers for offline functionality
- [ ] **Dark Mode**: Theme toggle
- [ ] **Multi-language Support**: i18n for other languages
- [ ] **Receipt Templates**: Support for other stores (Target, Walmart, etc.)

### Features
- [ ] **Payment Tracking**: Mark who has paid
- [ ] **Payment Integration**: Venmo, PayPal, UPI links
- [ ] **Export Options**: Export to CSV, PDF, or send via email
- [ ] **Recurring Bills**: Templates for regular shopping trips
- [ ] **Group Management**: Save friend groups for reuse
- [ ] **Receipt History**: Archive and search past receipts
- [ ] **Analytics**: Spending insights and trends

### Technical Improvements
- [ ] **PostgreSQL Migration**: Move from SQLite to PostgreSQL for production
- [ ] **Docker Deployment**: Containerize the application
- [ ] **Automated Tests**: Unit and integration tests
- [ ] **CI/CD Pipeline**: GitHub Actions for automated deployment
- [ ] **Error Tracking**: Sentry or similar for production monitoring
- [ ] **Logging**: Structured logging with Winston or Pino

### Mobile
- [ ] **Native Mobile App**: React Native version
- [ ] **Camera Optimization**: Better camera integration for receipt capture
- [ ] **Push Notifications**: Reminders for unpaid bills

## Deployment

### Quick Deploy Options

**Option 1: Single Server (VPS)**
1. Deploy backend and frontend to same server
2. Use nginx to serve frontend and proxy API requests
3. Use PM2 to manage Node.js process

**Option 2: Separate Services**
- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Database**: Use PostgreSQL on hosted service

**Option 3: Docker**
```bash
# Build and run with Docker Compose (create docker-compose.yml first)
docker-compose up -d
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for making bill splitting easier!**
