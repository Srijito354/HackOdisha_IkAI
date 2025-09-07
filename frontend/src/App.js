import React, { useState } from "react";
import "./App1.css";

function App() {
   const [query, setQuery] = useState("");
const [response, setResponse] = useState("");
const [selectedFile, setSelectedFile] = useState(null);
const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]); 

 // File change
 const handleFileChange = (e) => {
 setSelectedFile(e.target.files[0]);
 };

 // Upload CSV to backend
 const handleUpload = async () => {
 if (!selectedFile) {
 setResponse(" Please select a CSV file before uploading!"); 
 return;
}

 const formData = new FormData();
 formData.append("file", selectedFile);

 try {
setLoading(true);
 setResponse("Loading: Uploading your file..."); 

 const res = await fetch("http://localhost:5000/upload", {
 method: "POST",
 body: formData,
 });

 const data = await res.json();
 if (res.ok) {
 setResponse(` CSV uploaded successfully: ${selectedFile.name}`);
 setTableData(data.preview);
 } else {
 setResponse(` Upload failed: ${data.error}`);
 setTableData([]); 
 }
 } catch (err) {
 console.error("Upload failed:", err);
 setResponse(" File upload failed!");
 setTableData([]); 
 } finally {
 setLoading(false);
 }
 };

// Ask a natural language question
const handleQuery = async () => {
 if (!query.trim()) {
 setResponse(" Please enter a question!"); 
return;
 }

 try {
 setLoading(true);
 setResponse("Loading: Processing your question..."); 

// Step 1: Query API
 const res = await fetch("http://localhost:5000/query", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ question: query }),
 });

 const data = await res.json();
 if (!res.ok) {
 setResponse(` Error: ${data.error}`);
 return;
 }

 // Step 2: Summarize API
 const sumRes = await fetch("http://localhost:5000/summarize", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ question: query, result: data.result }),
 });

 const summary = await sumRes.json();
 if (sumRes.ok) {
 setResponse(` ${summary.answer}`); 
} else {
 setResponse(` Error: ${summary.error}`); 
 }
 } catch (err) {
 console.error("Query failed:", err);
 setResponse(" Something went wrong while processing your query!");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="container-box">
 <h1>VaaniDB</h1>
 <p className="subtitle">Talk to Your Data Instantly</p>

 {/* Upload Section */}
 <div className="mb-4 text-start">
 <label className="form-label fw-bold">Upload CSV</label>
 <div className="d-flex">
 <input
 type="file"
 className="form-control me-2"
accept=".csv"
 onChange={handleFileChange}
 />
 <button
 className="btn btn-primary btn-custom"
 onClick={handleUpload}
 disabled={loading}
 >
 {loading ? "Uploading..." : "Upload"}
 </button>
 </div>
</div>

 {/* Query Section */}
 <div className="mb-4 text-start">
 <label className="form-label fw-bold">Ask a Question</label>
<div className="d-flex">
 <textarea
 className="form-control me-2"
 placeholder="e.g. Show me total sales in Mumbai last month across all regions"
 rows="3"
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 style={{ resize: 'vertical' }}
 ></textarea>
<button
 className="btn btn-success btn-custom"
 onClick={handleQuery}
 disabled={loading}
 >
 {loading ? "Asking..." : "Ask"}
 </button>
 </div>
 </div>

 {/* Response Section */}
 {response && (
 <div className="alert alert-info text-start shadow-sm">
 <strong>Response:</strong> {response}
 </div>
 )}

      {/* Data Table Preview */}
      {tableData?.length && (
        <div className="table-responsive mt-4">
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                {Object.keys(tableData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

</div>
);
}

export default App;