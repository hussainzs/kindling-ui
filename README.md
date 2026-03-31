# Kindling UI

## Prerequisites
- [Node.js v18+](https://nodejs.org/)
- VS Code

## Setup

### 1. Clone and install
```
git clone https://github.com/hussainzs/kindling-ui.git
cd <repo-name>
npm run install:all
```

### 2. Install recommended VS Code extensions
Open the repo in VS Code. When prompted **"Do you want to install the recommended extensions?"**, click **Install**.
If you miss the prompt: `Ctrl+Shift+P` → "Show Recommended Extensions" → install all.

### 3. Set up environment variables
In server folder, copy `.env.example` to `.env`. <br>
Open `server/.env` and fill in the API keys.

### 4. Run the app
To run both frontend and backend concurrently, use the following from the root directory:
```
npm run dev
```

To run just the frontend:
```
cd client
npm run dev
```

To run just the backend:
```
cd server
npm run dev
```

## Notes:
Frontend: http://localhost:5173 <br>
Backend: http://localhost:5000

- Formatting happens automatically on save. Don't fight the formatter.
- ESLint warnings show as yellow underlines. Fix them before pushing.