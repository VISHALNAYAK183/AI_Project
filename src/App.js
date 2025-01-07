import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Library for parsing Excel files
import mammoth from 'mammoth'; // Library for extracting text from Word documents
import { geminiQa } from './services/geminiApi'; // Custom API for handling questions and answers
import './App.css'; // External CSS file for styling

export default function App() {
  // State variables
  const [selectedFile, setSelectedFile] = useState(null); // Stores the uploaded file
  const [allText, setAllText] = useState([]); // Stores extracted text from the file
  const [uploaded, setUploaded] = useState(false); // Tracks whether a file has been successfully uploaded
  const [question, setQuestion] = useState(''); // Stores the user's question
  const [messages, setMessages] = useState([]); // Stores chat messages between user and bot
  const [loading, setLoading] = useState(false); // Tracks file processing/loading status
  const [googleLink, setGoogleLink] = useState(''); // Stores the Google Docs/Sheets link
  const [linkLoading, setLinkLoading] = useState(false); // Tracks Google Docs/Sheets link processing

  // Handles file input change
  const handleFileChange = (e) => {
    const files = e.target.files;
    setSelectedFile(files[0] || null); // Sets the selected file
  };

  // Handles file upload and determines the file type
  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file.'); // Alerts user if no file is selected
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase(); // Extracts file extension
    setLoading(true); // Sets loading state

    // Handles different file types: PDF, Word, and Excel
    if (fileExtension === 'pdf') {
      handlePdfUpload();
    } else if (fileExtension === 'docx') {
      handleWordUpload();
    } else if (fileExtension === 'xlsx') {
      handleExcelUpload();
    } else {
      alert('Unsupported file type. Please upload a PDF, Word, or Excel file.');
      setLoading(false); // Stops loading for unsupported file types
    }
  };

  // Handles PDF file upload and text extraction
  const handlePdfUpload = () => {
    const reader = new FileReader();
    reader.onload = () => {
      extractTextFromPdf(reader.result); // Calls function to extract text from PDF
    };
    reader.readAsDataURL(selectedFile); // Reads the file as a data URL
  };

  // Handles Word file upload and text extraction using mammoth
  const handleWordUpload = async () => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer }); // Extracts text from Word file
        setAllText([result.value]); // Stores the extracted text
        setUploaded(true); // Marks upload as complete
        setLoading(false); // Stops loading state
      };
      reader.readAsArrayBuffer(selectedFile); // Reads the file as an ArrayBuffer
    } catch (err) {
      alert(`Error processing Word file: ${err.message}`); // Alerts user on error
      console.error(err); // Logs error for debugging
      setLoading(false);
    }
  };

  // Handles Excel file upload and text extraction using XLSX
  const handleExcelUpload = () => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result); // Reads data as an array buffer
      const workbook = XLSX.read(data, { type: 'array' }); // Reads workbook
      const sheets = workbook.SheetNames; // Gets sheet names

      // Extracts text from each sheet
      const extracted = sheets.map((sheetName) =>
        XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
          .map((row) => row.join(' ')) // Joins row values
          .join('\n') // Joins rows into text
      );

      setAllText(extracted); // Stores extracted text
      setUploaded(true); // Marks upload as complete
      setLoading(false); // Stops loading state
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Extracts text from a PDF using pdf.js
  async function extractTextFromPdf(pdfDataUrl) {
    try {
      const loadingTask = window.pdfjsLib.getDocument(pdfDataUrl);
      const pdf = await loadingTask.promise; // Loads the PDF document
      const pages = pdf.numPages; // Gets the number of pages
      const extracted = []; // Array to store extracted text

      // Loops through each page to extract text
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((s) => s.str).join(''); // Joins text from the page
        extracted.push(pageText);
      }

      setAllText(extracted); // Stores extracted text
      setUploaded(true); // Marks upload as complete
      setLoading(false); // Stops loading state
    } catch (err) {
      alert(`Error: ${err.message}`); // Alerts user on error
      console.error(err); // Logs error for debugging
      setLoading(false);
    }
  }

  // Handles Google Docs/Sheets link processing
  const handleProcessGoogleLink = async () => {
    if (!googleLink) {
      alert('Please enter a Google Docs or Sheets link.');
      return;
    }
    setLinkLoading(true); // Sets link loading state
    try {
      const docId = extractGoogleDocId(googleLink); // Extracts document ID
      if (docId) {
        const text = await fetchGoogleDocContent(docId); // Fetches document content
        setAllText([text]); // Stores the extracted text
        setUploaded(true); // Marks upload as complete
      } else {
        alert('Invalid Google Docs/Sheets link'); // Alerts for invalid link
      }
    } catch (error) {
      console.error('Error processing Google link:', error); // Logs error
      alert('Error processing Google Docs/Sheets link'); // Alerts user
    } finally {
      setLinkLoading(false); // Stops link loading state
    }
  };

  // Extracts the Google Docs/Sheets document ID from the URL
  const extractGoogleDocId = (link) => {
    const regex = /(?:docs.google.com\/(?:document|spreadsheets)\/d\/)([^/]+)/;
    const match = link.match(regex);
    return match ? match[1] : null;
  };

  // Fetches content from Google Docs/Sheets
  const fetchGoogleDocContent = async (docId) => {
    const docUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const response = await fetch(docUrl); // Fetches document as text
    const text = await response.text(); // Converts response to text
    return text;
  };

  // Resets state to allow uploading another file
  const handleExtractAnother = () => {
    setSelectedFile(null); // Clears the selected file
    setAllText([]); // Clears extracted text
    setUploaded(false); // Resets upload status
    setMessages([]); // Clears chat messages
  };

  // Submits a question to the Gemini API and gets a response
  const handleQuestionSubmit = async () => {
    if (!question.trim()) return; // Ignores empty questions

    try {
      setMessages([...messages, { text: question, sender: 'user' }]); // Adds user message to chat
      setQuestion(''); // Clears the input field

      const answer = await geminiQa(question, messages, allText); // Sends question to API
      setMessages([
        ...messages,
        { text: question, sender: 'user' },
        { text: answer.data.answer, sender: 'gemini' }, // Adds bot's response to chat
      ]);
    } catch (error) {
      console.error('Error while asking Gemini:', error); // Logs error
    }
  };

  // Handles Enter key press to submit question
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleQuestionSubmit(); // Submits the question
      e.preventDefault(); // Prevents default behavior
    }
  };

  // Component rendering
  return (
    <div className="container">
      <h1 className="title">Find Your Answer With Me</h1>
      <p className="subtitle">
        Upload PDF, Word, Excel files or Google Docs/Sheets to Simplify your Problem
      </p>
  
      {/* Upload and Process Google Link Section */}
      {!linkLoading && !loading && !uploaded && (
        <div className="uploadSection">
          <input
            type="text"
            placeholder="Enter Google Docs/Sheets Link"
            value={googleLink}
            onChange={(e) => setGoogleLink(e.target.value)}
            className="input"
          />
          <button onClick={handleProcessGoogleLink} className="primaryButton">
            {linkLoading ? 'Processing...' : 'Process Google Docs/Sheets'}
          </button>
        </div>
      )}
  
      {/* Divider */}
      {!loading && !linkLoading && !uploaded && <p className="divider">OR</p>}
  
      {/* File Upload Section */}
      {!linkLoading && !loading && !uploaded && (
        <div className="uploadSection">
          <label className="fileLabel">
            <input
              type="file"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="fileInput"
            />
            Choose File
          </label>
          {selectedFile && <p className="fileName">{selectedFile.name}</p>}
          <button
            onClick={handleUpload}
            className={`primaryButton ${selectedFile ? '' : 'disabled'}`}
            disabled={!selectedFile}
          >
            Upload & Extract
          </button>
        </div>
      )}
  
      {/* Loading Spinner */}
      {(loading || linkLoading) && (
        <div className="loadingContainer">
          <p>{linkLoading ? 'Processing Google Docs/Sheets...' : 'Processing your file...'}</p>
        </div>
      )}
  
      {/* Chat and Results Section */}
      {uploaded && (
        <div className="resultSection">
          <button onClick={handleExtractAnother} className="secondaryButton">
            Extract Another File
          </button>
          <div className="chatContainer">
            <div className="chatBox">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={msg.sender === 'user' ? 'userMessage' : 'botMessage'}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="inputContainer">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyPress}
                className="input"
                placeholder="Ask a question..."
              />
              <button onClick={handleQuestionSubmit} className="primaryButton">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}
