# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Setup Database
```bash
npm run db:setup
npm run db:seed
```

### 3. Start the App
```bash
npm run dev
```

### 4. Open Browser
Navigate to **http://localhost:3000**

---

## 🧪 Test with Sample Data

Login with:
- **Username**: `testuser`
- **Password**: `password123`

Click on **"Sample Costco Trip"** to see a pre-populated session with:
- 3 participants (Alice, Bob, Charlie)
- 8 items from a typical Costco run
- Sample assignments already configured

---

## ✨ Create Your First Bill Split

1. **Sign Up** (or use test account)
2. Click **"+ New Split"** on dashboard
3. Enter a name like "Weekend Costco Run"
4. Click **"Enter Manually"** → **"Load Sample"** for quick testing
5. Add participants: Alice, Bob, Charlie
6. Assign items by clicking participant chips
7. Switch to **"Summary"** tab to see the split!

---

## 📱 Mobile Testing

Open **http://localhost:3000** on your Android device (both devices must be on the same network).

Or use Chrome DevTools:
1. Press `F12` in Chrome
2. Click the device toolbar icon
3. Select a mobile device to test responsive layout

---

## 🛠️ Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend |
| `npm run dev:backend` | Start backend only (port 3001) |
| `npm run dev:frontend` | Start frontend only (port 3000) |
| `npm run db:seed` | Re-seed sample data |
| `cd backend && npx prisma studio` | Open database GUI |

---

## 💡 Quick Tips

- **Manual Entry**: Use "Load Sample" button to quickly populate test data
- **Multi-Select**: Click multiple participant chips to split an item
- **Quick Actions**: Use "Select All" and "Clear" buttons for batch operations
- **Filter**: Use "Unassigned" filter to find items that need assignment
- **Tax Calculation**: Tax is distributed proportionally based on taxable items

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Database issues?**
```bash
cd backend
npx prisma migrate reset
npm run db:seed
```

**Dependencies not working?**
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

---

## 📚 Next Steps

- Check [README.md](README.md) for full documentation
- See the "Follow-Up Tasks" section for enhancement ideas
- Start customizing the UI in `frontend/src/components/`
- Modify OCR parsing logic in `backend/src/services/receiptParser.ts`

---

**🎉 You're all set! Happy bill splitting!**
