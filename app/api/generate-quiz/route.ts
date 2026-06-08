import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai'; // 🌟 CHANGED: Swapped generateObject for generateText & Output
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// The schema structure stays exactly the same
const studyMaterialSchema = z.object({
  summary: z.string().describe('A markdown-formatted comprehensive summary of the core concepts.'),
  keyTerms: z.array(
    z.object({
      term: z.string(),
      definition: z.string()
    })
  ).describe('Important vocabulary, dates, formulas, or concepts from the document.'),
  quiz: z.array(
    z.object({
      question: z.string().describe('A clear multiple-choice question based on the document contents.'),
      options: z.array(z.string()).describe('Exactly four plausible options for the answer.'),
      correctIndex: z.number().describe('The 0-based index of the correct answer inside the options array (0 to 3).'),
      explanation: z.string().describe('A quick snippet explaining why this answer is correct.')
    })
  ).describe('A practice test covering the material provided.')
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🌟 CHANGED: Using generateText with an output schema config instead
    const { output } = await generateText({
      model: google('gemini-2.5-flash'), 
      output: Output.object({ schema: studyMaterialSchema }), // Tells the AI to build a strict JSON object
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Analyze this study material. Read through the text, diagrams, or images completely. Generate a summary, key terms list, and a multiple-choice practice quiz.' 
            },
            { 
              type: 'file', 
              data: buffer, 
              mediaType: file.type 
            }
          ]
        }
      ]
    });

    return NextResponse.json(output); // 🌟 CHANGED: Returns the clean output block

  } catch (error) {
    console.error('Quiz Generation Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while processing your document.' }, 
      { status: 500 }
    );
  }
}