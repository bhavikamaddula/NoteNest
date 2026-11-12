
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

  const deleteNote = id => {
    axios.delete(url + "/notes/" + id).then(getNotes);
  };

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
    <main className="app-container">

      <header className="header">
        <h1>NEW NOTENEST DESIGN</h1>
        <p>Your Space. Your Notes. Your Knowledge.</p>
      </header>

      <section className="section">
        <h2>Create a Note</h2>

        <input
          placeholder="Enter note title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          placeholder="Enter subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />

        <textarea
          placeholder="Write your thoughts here..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <button onClick={addNote}>+ Add Note</button>
      </section>

      <section className="section">
        <h2>My Notes</h2>

        <div className="notes-grid">
          {notes.length === 0 ? (
            <p className="empty">No notes available. Create your first note!</p>
          ) : (
            notes.map(n => (
              <div className="note-card" key={n._id}>
                <h3>{n.title}</h3>
                <span className="subject">{n.subject}</span>
                <p>{n.content}</p>
                <button onClick={() => deleteNote(n._id)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2>My PDF Library</h2>

        <div className="upload-area">
          <p>Upload your study materials</p>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={uploadPDF}
          />
        </div>

        <div className="pdf-grid">
          {pdfs.length === 0 ? (
            <p className="empty">No PDFs uploaded yet.</p>
          ) : (
            pdfs.map(p => (
              <div className="pdf-card" key={p._id}>
                <h3>PDF Document</h3>
                <p>{p.name}</p>

                <a
                  href={url + "/pdfs/" + p._id + "/view"}
                  target="_blank"
                  rel="noreferrer"
                >
                  View PDF
                </a>

                {" | "}

                <a href={url + "/pdfs/" + p._id + "/download"}>
                  Download
                </a>

                <br />

                <button onClick={() => deletePDF(p._id)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="footer">
        Made with care | NoteNest © 2026
      </footer>

    </main>
  );
}

export default App;
