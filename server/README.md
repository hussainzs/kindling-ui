# Kindling UI Backend (Server)

Simple Node.js/Express backend for the Kindling UI project.

## Development Setup

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in `server/` with:
   ```env
   CEREBRAS_API_KEY=your_key_here
   PORT=5000
   ```

3. **Run Server**:
   ```bash
   npm run dev
   ```
   The server will be available at: `http://localhost:5000`

---

## API Endpoints

### 1. Health Check
- **URL**: `http://localhost:5000/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  { "status": "ok", "message": "Server is running" }
  ```

### 2. Milestone Suggestions (Cerebras AI)
Generates short drawing milestones based on user notes and existing milestones. Note, the notesSoFar is a running text of what the user has been writing it maybe incomplete and thats okay. Please call this route after user has written at least a few words before asking for a milestone suggestion. existingMilestones is optional but if provided it will help the model avoid suggesting redundant milestones.

- **URL**: `http://localhost:5000/api/milestone-suggestions`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "notesSoFar": "Drawing a rainy cyberpunk city alleyway",
    "existingMilestones": ["Sketch perspective", "Block in neon colors"]
  }
  ```
  *(Note: `existingMilestones` is optional)*
- **Success Response (200 OK)**:
  ```json
  { "milestone": "Add wet ground reflections" }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing or invalid parameters.
  - `500 Internal Server Error`: AI model or server failure.
  - `502 Bad Gateway`: Model not found/access denied (provider error).


## Testing & Validation

- **Smoke Test**: Run `npm run test:milestone` to verify the AI connection and API flow end-to-end.
- **Checking Syntax**: Run `npm run build` to perform a basic syntax check on all core files.
