import { useState } from "react";
import jsPDF from "jspdf";
import { marked } from "marked";

function PromptPage() {
  const [prompt, setPrompt] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setStreamedText("");

    try {
      const res = await fetch("http://localhost:3000/generate-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to initiate streaming");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split("\n\n");
        for (const event of events) {
          if (event.startsWith("data: ")) {
            try {
              const data = JSON.parse(event.replace("data: ", ""));
              if (data.chunk) {
                accumulatedText += data.chunk;
                setStreamedText(accumulatedText);
              } else if (data.final) {
                // Normalize the response
                const normalizedResponse = {
                  title: data.final.title || "Untitled Research Paper",
                  abstract: data.final.abstract || "No abstract provided.",
                  introduction:
                    data.final.introduction || "No introduction provided.",
                  data: data.final.data || "No data provided.",
                  analysis: data.final.analysis || "No analysis provided.",
                  references: Array.isArray(data.final.references)
                    ? data.final.references
                    : [],
                  ...data.final, // Preserve additional fields
                };
                setResponse(normalizedResponse);
                setLoading(false);
              } else if (data.error) {
                setError(data.error);
                setLoading(false);
              }
            } catch (parseError) {
              console.error("Failed to parse event data:", parseError);
            }
          }
        }
      }
    } catch (err) {
      setError("An error occurred while streaming the response");
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setFont("helvetica", "normal");
      const margin = 15;
      let y = 20;
      const maxWidth = 180;
      const lineHeight = 7;

      // Helper function to add content based on type
      const addContent = (title, content) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(title, margin, y);
        y += lineHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        if (!content) {
          doc.text("No content provided.", margin, y);
          y += lineHeight + 5;
        } else if (typeof content === "string") {
          // Parse markdown to plain text
          const plainText = marked
            .parse(content, { async: false })
            .replace(/<[^>]+>/g, "");
          const splitText = doc.splitTextToSize(plainText, maxWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight + 5;
        } else if (Array.isArray(content)) {
          content.forEach((item, index) => {
            const itemText =
              typeof item === "string" ? item : JSON.stringify(item);
            const splitText = doc.splitTextToSize(
              `${index + 1}. ${itemText}`,
              maxWidth
            );
            doc.text(splitText, margin, y);
            y += splitText.length * lineHeight;
          });
          y += 5;
        } else if (typeof content === "object") {
          const jsonText = JSON.stringify(content, null, 2);
          const splitText = doc.splitTextToSize(jsonText, maxWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight + 5;
        } else {
          const splitText = doc.splitTextToSize(String(content), maxWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight + 5;
        }

        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      };

      // Define known sections
      const sections = [
        { key: "title", label: "Title" },
        { key: "abstract", label: "Abstract" },
        { key: "introduction", label: "Introduction" },
        { key: "data", label: "Data" },
        { key: "analysis", label: "Analysis" },
      ];

      // Add known sections
      sections.forEach(({ key, label }) => {
        if (response[key]) {
          addContent(label, response[key]);
        }
      });

      // Add additional fields dynamically
      Object.keys(response)
        .filter(
          (key) =>
            ![
              "title",
              "abstract",
              "introduction",
              "data",
              "analysis",
              "references",
            ].includes(key)
        )
        .forEach((key) => {
          addContent(key.charAt(0).toUpperCase() + key.slice(1), response[key]);
        });

      // Add references
      if (response.references.length > 0) {
        addContent("References", response.references);
      }

      doc.save(`${response.title || "research_paper"}.pdf`);
    } catch (err) {
      setError("Failed to generate PDF");
      console.error(err);
    }
  };

  const handleDownloadDOC = () => {
    try {
      let docContent = "Research Paper Outline\n\n";

      // Helper function to format content for DOC
      const formatContent = (content) => {
        if (!content) return "No content provided.";
        if (typeof content === "string") {
          return marked
            .parse(content, { async: false })
            .replace(/<[^>]+>/g, "");
        }
        if (Array.isArray(content)) {
          return content
            .map(
              (item, index) =>
                `${index + 1}. ${
                  typeof item === "string" ? item : JSON.stringify(item)
                }`
            )
            .join("\n");
        }
        if (typeof content === "object") {
          return JSON.stringify(content, null, 2);
        }
        return String(content);
      };

      // Add known sections
      const sections = [
        { key: "title", label: "Title" },
        { key: "abstract", label: "Abstract" },
        { key: "introduction", label: "Introduction" },
        { key: "data", label: "Data" },
        { key: "analysis", label: "Analysis" },
      ];

      sections.forEach(({ key, label }) => {
        if (response[key]) {
          docContent += `${label}:\n${formatContent(response[key])}\n\n`;
        }
      });

      // Add additional fields dynamically
      Object.keys(response)
        .filter(
          (key) =>
            ![
              "title",
              "abstract",
              "introduction",
              "data",
              "analysis",
              "references",
            ].includes(key)
        )
        .forEach((key) => {
          docContent += `${
            key.charAt(0).toUpperCase() + key.slice(1)
          }:\n${formatContent(response[key])}\n\n`;
        });

      // Add references
      if (response.references.length > 0) {
        docContent += `References:\n${formatContent(response.references)}\n`;
      }

      const blob = new Blob([docContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${response.title || "research_paper"}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download DOC");
      console.error(err);
    }
  };

  // Render content dynamically
  const renderContent = (content) => {
    if (!content) return <p className="text-gray-600">No content provided.</p>;
    if (typeof content === "string") {
      return (
        <div
          className="text-gray-600"
          dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
        />
      );
    }
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc pl-5 text-gray-600">
          {content.map((item, index) => (
            <li key={index}>{renderContent(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof content === "object") {
      return (
        <pre className="text-gray-600 bg-gray-50 p-4 rounded-md">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }
    return <p className="text-gray-600">{String(content)}</p>;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Research Paper Generator
      </h1>
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="prompt"
          >
            Enter Research Topic
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Top Countries by GDP"
            required
          />
          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Research Outline"}
          </button>
        </form>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {streamedText && !response && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Streaming Response
            </h2>
            <pre className="text-gray-600 bg-gray-50 p-4 rounded-md">
              {streamedText}
            </pre>
          </div>
        )}

        {response && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
              >
                Download PDF
              </button>
              <button
                onClick={handleDownloadDOC}
                className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
              >
                Download DOC
              </button>
            </div>

            {[
              { key: "title", label: "Title" },
              { key: "abstract", label: "Abstract" },
              { key: "introduction", label: "Introduction" },
              { key: "data", label: "Data" },
              { key: "analysis", label: "Analysis" },
            ].map(
              ({ key, label }) =>
                response[key] && (
                  <div key={key}>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {label}
                    </h2>
                    {renderContent(response[key])}
                  </div>
                )
            )}

            {Object.keys(response)
              .filter(
                (key) =>
                  ![
                    "title",
                    "abstract",
                    "introduction",
                    "data",
                    "analysis",
                    "references",
                  ].includes(key)
              )
              .map((key) => (
                <div key={key}>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </h2>
                  {renderContent(response[key])}
                </div>
              ))}

            {response.references.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  References
                </h2>
                {renderContent(response.references)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptPage;

// import { useState, useEffect } from "react";

// function PromptPage() {
//   const [prompt, setPrompt] = useState("");
//   const [streamedText, setStreamedText] = useState("");
//   const [response, setResponse] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setResponse(null);
//     setStreamedText("");

//     try {
//       const res = await fetch("http://localhost:3000/generate-stream", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "text/event-stream",
//         },
//         body: JSON.stringify({ prompt }),
//       });

//       if (!res.ok) {
//         throw new Error("Failed to initiate streaming");
//       }

//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();
//       let accumulatedText = "";

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         // Split chunk by SSE delimiter (\n\n)
//         const events = chunk.split("\n\n");
//         for (const event of events) {
//           if (event.startsWith("data: ")) {
//             const data = JSON.parse(event.replace("data: ", ""));
//             if (data.chunk) {
//               accumulatedText += data.chunk;
//               setStreamedText(accumulatedText);
//             } else if (data.final) {
//               setResponse(data.final);
//               setLoading(false);
//             } else if (data.error) {
//               setError(data.error);
//               setLoading(false);
//             }
//           }
//         }
//       }
//     } catch (err) {
//       setError("An error occurred while streaming the response");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">
//         Research Paper Generator
//       </h1>
//       <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
//         <form onSubmit={handleSubmit} className="mb-6">
//           <label
//             className="block text-gray-700 text-sm font-bold mb-2"
//             htmlFor="prompt"
//           >
//             Enter Research Topic
//           </label>
//           <input
//             id="prompt"
//             type="text"
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="e.g., Top Countries by GDP"
//             required
//           />
//           <button
//             type="submit"
//             className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
//             disabled={loading}
//           >
//             {loading ? "Generating..." : "Generate Research Outline"}
//           </button>
//         </form>

//         {error && <div className="text-red-500 mb-4">{error}</div>}

//         {streamedText && !response && (
//           <div className="mb-6">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Streaming Response
//             </h2>
//             <pre className="text-gray-600 bg-gray-50 p-4 rounded-md">
//               {streamedText}
//             </pre>
//           </div>
//         )}

//         {response && (
//           <div className="space-y-4">
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">Title</h2>
//               <p className="text-gray-600">{response.title}</p>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">Abstract</h2>
//               <p className="text-gray-600">{response.abstract}</p>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Introduction
//               </h2>
//               <p className="text-gray-600">{response.introduction}</p>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">Data</h2>
//               <p className="text-gray-600">{response?.data}</p>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">Analysis</h2>
//               <p className="text-gray-600">{response?.analysis}</p>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">
//                 References
//               </h2>
//               <ul className="list-disc pl-5 text-gray-600">
//                 {response.references.map((ref, index) => (
//                   <li key={index}>{ref}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default PromptPage;
