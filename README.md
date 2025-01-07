


**Live Website**: [https://vishal-ai.web.app/](https://vishal-ai.web.app/)



## Features

- **File Upload and Text Extraction**:
  - Supports **PDF**, **Word (.docx)**, and **Excel (.xlsx)** files.
  - Automatically extracts text from uploaded files for further interaction.

- **Google Docs/Sheets Integration**:
  - Accepts public Google Docs and Sheets links.
  - Extracts and processes content from the provided link.

- **Chatbot Functionality**:
  - Users can ask questions related to the uploaded/processed content.
  - Powered by the Gemini API for intelligent responses.

- **Responsive Design**:
  - Fully responsive and optimized for both desktop and mobile devices.
  - Clean and modern UI with an intuitive user experience.

## Installation

Follow these steps to run the application locally:

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- Basic knowledge of React.js.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/VISHALNAYAK183/AI_Project.git
   cd Vishal_ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your Gemini API key:
   - Open `src/services/geminiApi.js`.
   - Add your Gemini API credentials in the file.

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## File Structure

```
src/
├── App.js          # Main application logic
├── App.css         # Styling for the application
├── services/
│   └── geminiApi.js # API service for interacting with Gemini API
└── index.js        # Application entry point
```

## How to Use

1. **File Upload**:
   - Click **Choose File** to upload a PDF, Word, or Excel file.
   - Click **Upload & Extract** to process the file and extract its text.

2. **Google Docs/Sheets**:
   - Paste a public Google Docs or Sheets link into the text box.
   - Click **Process Google Docs/Sheets** to extract its content.

3. **Chat**:
   - After uploading or processing, type your question in the chat box.
   - Click **Send** or press **Enter** to receive responses related to the content.

4. **Extract Another File**:
   - Click **Extract Another File** to reset the app and upload or process a new file.

## Technologies Used

- **Frontend**: React.js
- **Libraries**:
  - `xlsx`: For Excel file parsing.
  - `mammoth`: For Word file parsing.
  - `pdf.js`: For PDF text extraction.
- **API**: Gemini API for chatbot responses.
- **Styling**: CSS with responsive design.





