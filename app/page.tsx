"use client";

import { useState } from 'react';

// Define the data shapes so TypeScript knows exactly what our data looks like
interface KeyTerm {
  term: string;
  definition: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface StudyMaterial {
  summary: string;
  keyTerms: KeyTerm[];
  quiz: QuizQuestion[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudyMaterial | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'vocab' | 'quiz'>('summary');
  
  // Track user quiz answers: { [questionIndex]: selectedOptionIndex }
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setData(null);
    setAnswers({}); // Reset previous answers

    // Prepare the multi-part form payload
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to generate quiz');

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      alert('An error occurred while generating your study materials. Check your console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-600 mb-2">
            AI Study Buddy
          </h1>
          <p className="text-slate-600">
            Upload any PDF, Image, or Word Document to get instant summaries and practice tests.
          </p>
        </header>

        {/* Upload Form Box */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full flex-1">
              <input
                type="file"
                accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={!file || loading}
              className="w-full sm:w-auto bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Material...' : 'Generate Guide'}
            </button>
          </form>
        </section>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Reading your document and formulating materials...</p>
          </div>
        )}

        {/* Dashboard Content Container */}
        {data && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Tab Controller Navigation */}
            <nav className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition ${
                  activeTab === 'summary'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('vocab')}
                className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition ${
                  activeTab === 'vocab'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Vocabulary ({data.keyTerms.length})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition ${
                  activeTab === 'quiz'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Practice Quiz ({data.quiz.length})
              </button>
            </nav>

            {/* Main Dynamic View Panels */}
            <div className="p-6 md:p-8">
              
              {/* Tab 1: Markdown Summary Panel */}
              {activeTab === 'summary' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4 text-slate-800">Key Takeaways</h2>
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {data.summary}
                  </div>
                </div>
              )}

              {/* Tab 2: Vocab Card Grid Panel */}
              {activeTab === 'vocab' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-slate-800">Core Concepts & Definitions</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.keyTerms.map((item, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-indigo-700 mb-1">{item.term}</h3>
                        <p className="text-sm text-slate-600">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Interactive Practice Quiz Panel */}
              {activeTab === 'quiz' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold text-slate-800">Test Your Knowledge</h2>
                  {data.quiz.map((q, qIndex) => {
                    const isAnswered = answers[qIndex] !== undefined;
                    const userAnswer = answers[qIndex];

                    return (
                      <div key={qIndex} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4">
                          {qIndex + 1}. {q.question}
                        </h3>
                        
                        {/* Quiz Buttons Selection Grid */}
                        <div className="grid gap-3">
                          {q.options.map((option, optIndex) => {
                            const isCorrect = optIndex === q.correctIndex;
                            const isSelected = optIndex === userAnswer;

                            let btnStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100";
                            
                            // Color changing logic upon selection
                            if (isAnswered) {
                              if (isCorrect) {
                                btnStyle = "bg-green-100 border-green-500 text-green-800 font-medium";
                              } else if (isSelected) {
                                btnStyle = "bg-red-100 border-red-500 text-red-800";
                              } else {
                                btnStyle = "bg-white border-slate-100 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIndex}
                                disabled={isAnswered}
                                onClick={() => setAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                                className={`w-full text-left p-3 rounded-xl border text-sm transition font-normal ${btnStyle}`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {/* Expandable Explanation Block */}
                        {isAnswered && (
                          <div className="mt-4 p-3 bg-indigo-50 text-indigo-900 text-xs rounded-xl border border-indigo-100">
                            <strong>{answers[qIndex] === q.correctIndex ? '✨ Correct! ' : '❌ Incorrect. '}</strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </main>
  );
}