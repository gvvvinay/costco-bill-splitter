# Ollama Local Vision Setup Guide

Your bill splitter now uses **Ollama with llava** for receipt parsing - completely free and private!

## Installation Steps

### 1. Install Ollama (5 minutes)

**Windows:**
1. Go to https://ollama.ai
2. Download Ollama for Windows
3. Run the installer
4. Restart your computer when prompted

**macOS/Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

### 2. Download the llava Model (5-10 minutes)

This model can "see" images and extract text from them.

Open a terminal/PowerShell and run:
```bash
ollama pull llava
```

This downloads ~5GB and may take a few minutes depending on your internet.

To verify it worked:
```bash
ollama list
```

You should see `llava` in the list.

### 3. Start Ollama Server

Keep this running in a terminal while developing:

**Windows:**
```bash
ollama serve
```

Or if installed, just run the Ollama app (system tray).

**macOS/Linux:**
```bash
ollama serve
```

You'll see:
```
listening on 127.0.0.1:11434
```

This means it's ready!

### 4. Update .env (optional)

The defaults should work, but if needed:

```env
# backend/.env
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="llava"
```

### 5. Start the App

```bash
cd c:\tmp\costco-bill-splitter
npm run dev
```

### 6. Test It!

1. Go to http://localhost:3000
2. Create a bill split session
3. Upload a receipt image
4. Watch it extract items automatically! 🎉

---

## Advantages

✅ **Completely free** - No API costs ever
✅ **100% private** - Data never leaves your computer
✅ **Works offline** - No internet needed
✅ **No sign-ups** - Just install and use
✅ **Full control** - Run locally, own your data

---

## Troubleshooting

### "Cannot connect to Ollama"
- Make sure `ollama serve` is running in a terminal
- Check that port 11434 is accessible
- Default: http://localhost:11434

### "Model not found"
- Run: `ollama pull llava`
- This downloads the model (~5GB)

### "Out of memory"
- If your system has <8GB RAM, try `llava-phi` instead (lighter):
```bash
ollama pull llava-phi
# Then update .env:
# OLLAMA_MODEL="llava-phi"
```

### Slow responses
- First run takes longer as model loads
- Subsequent requests are faster
- llava needs ~6GB RAM while processing

### No items extracted
- Make sure receipt image is clear
- Try different lighting/angles
- Use manual entry as fallback

---

## System Requirements

**Minimum:**
- 8GB RAM (6GB for model)
- 20GB disk space
- CPU: Modern processor

**Recommended:**
- 16GB RAM
- GPU (NVIDIA, AMD, or Apple Silicon)
- SSD

---

## Different Models

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| **llava** | 5GB | Slower | Higher | Receipts (recommended) |
| **llava-phi** | 2.6GB | Faster | Good | Lower RAM systems |
| **mistral** | 4GB | Fast | Text only | Fallback (no vision) |

To switch models:
```bash
ollama pull llava-phi
# Update .env:
# OLLAMA_MODEL="llava-phi"
```

---

## Performance Tips

1. **Keep Ollama running** - Start once, keep it in background
2. **First request slower** - Model loads on first use (~10 sec)
3. **Subsequent requests faster** - Usually ~5-30 seconds per receipt
4. **GPU helps** - Much faster if you have NVIDIA GPU with CUDA

---

## Is Ollama Always Running?

Yes, while developing:

**Option 1: Terminal** (development)
```bash
ollama serve
```

**Option 2: System Tray** (Windows)
- Ollama app runs in system tray (auto-start)
- Right-click for options

**Option 3: Background Service**
- On macOS/Linux, runs as service

For production, you'd set up as a proper service.

---

## Compare to Other Options

| Option | Cost | Privacy | Speed | Setup |
|--------|------|---------|-------|-------|
| **Ollama (local)** | Free | Perfect | 5-30s | 20 min |
| **Google Gemini** | Free tier + | Good | 2-5s | 5 min |
| **Tesseract OCR** | Free | Perfect | 10-20s | Easy |

---

## Next Steps

1. Install Ollama: https://ollama.ai
2. Run: `ollama pull llava`
3. Run: `ollama serve`
4. Start the app: `npm run dev`
5. Test with a receipt!

---

## Get Help

**Ollama Issues:**
- https://github.com/jart/ollama/issues
- https://ollama.ai/library

**App Issues:**
- Check console logs during upload
- Try manual item entry as fallback

---

Enjoy free, private receipt parsing! 🚀
