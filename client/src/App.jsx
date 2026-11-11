
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const url = "http://localhost:5000";

  const getNotes = () =>
    axios.get(url + "/notes").then(r => setNotes(r.data));

  const getPDFs = () =>
    axios.get(url + "/pdfs").then(r => setPdfs(r.data));

  // Add Note
  const addNote = () => {
    if (!title || !subject || !content) {
      alert("Fill all fields");
      return;
    }

    axios.post(url + "/notes", { title, subject, content })
      .then(() => {
        setTitle("");
        setSubject("");
        setContent("");
        getNotes();
      });
  };

  // Delete Note
  const deleteNote = id => {
    axios.delete(url + "/notes/" + id).then(getNotes);
  };

  // Upload PDF
  const uploadPDF = e => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      e.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("pdf", file);

    axios.post(url + "/upload", data)
      .then(() => {
        alert("PDF uploaded successfully");
        getPDFs();
        e.target.value = "";
      })
      .catch(() => alert("PDF upload failed"));
  };

  // Delete PDF
  const deletePDF = id => {
    if (window.confirm("Delete this PDF?")) {
      axios.delete(url + "/pdfs/" + id).then(() => {
        getPDFs();
        alert("PDF deleted successfully");
      });
    }
  };

  useEffect(() => {
    getNotes();
    getPDFs();
  }, []);

  return (
    <div>
      <h1>NoteNest - Smart Notes Organizer</h1>

      <h2>Add Notes</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        placeholder="Subject"
        value={subject}
        onChange={e => setSubject(e.target.value)}
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <button onClick={addNote}>Add Note</button>

      <h2>My Notes</h2>

      {notes.map(n => (
        <div key={n._id}>
          <h3>{n.title}</h3>
          <p>{n.subject}</p>
          <p>{n.content}</p>
          <button onClick={() => deleteNote(n._id)}>
            Delete Note
          </button>
        </div>
      ))}

      <h2>Upload PDF</h2>

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={uploadPDF}
      />

      <h2>My PDFs</h2>

      {pdfs.map(p => (
        <div key={p._id}>
          <h3>{p.name}</h3>

          <a
            href={url + "/pdfs/" + p._id + "/view"}
            target="_blank"
            rel="noreferrer"
          >
            View PDF
          </a>

          {" | "}

          <a href={url + "/pdfs/" + p._id + "/download"}>
            Download PDF
          </a>

          <br />

          <button onClick={() => deletePDF(p._id)}>
            Delete PDF
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
