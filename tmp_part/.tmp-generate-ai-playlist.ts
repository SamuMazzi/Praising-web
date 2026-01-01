// /pages/api/generate-ai-playlist.ts (Conceptual changes for Assistants API)
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchLecturesForDate } from '@/logic/server/liturgy-api-helpers';
import OpenAI from 'openai';
// Import Firebase admin SDK and initialize it (you'll need to set this up)
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/logic/server/firebase-admin'; // A helper you'd create

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// You would get this from your OpenAI dashboard after creating an Assistant
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

// Initialize Firebase Admin SDK
initializeFirebaseAdmin(); // Make sure this is idempotent or called once
const db = admin.firestore();
const PLAYLIST_COLLECTION = 'ai_mass_playlists'; // Firestore collection name

interface AiPlaylistResponse {
  suggestions?: {
    [key: string]: { title: string; reason: string }; // e.g., entrance, offertory, etc.
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AiPlaylistResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { date } = req.body;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Sanitize date to be used as a document ID (e.g., YYYYMMDD)
    const playlistDocId = date.replace(/\D/g, ''); // Ensure it's just numbers

    // 1. Check Firebase for existing playlist
    const playlistDocRef = db
      .collection(PLAYLIST_COLLECTION)
      .doc(playlistDocId);
    const playlistDoc = await playlistDocRef.get();

    if (playlistDoc.exists) {
      console.log(`Found existing playlist for ${playlistDocId} in Firebase.`);
      return res.status(200).json({
        suggestions: playlistDoc.data() as AiPlaylistResponse['suggestions']
      });
    }

    const liturgyContent = await fetchLecturesForDate(date);
    if (!liturgyContent) {
      return res.status(500).json({ error: 'Could not fetch scriptures.' });
    }

    const scriptureText = `
      First Reading: ${liturgyContent.firstLecture?.title} - ${liturgyContent.firstLecture?.content}
      Psalm: ${liturgyContent.psalm?.title} - ${liturgyContent.psalm?.verses.join('\n')}
      ${liturgyContent.secondLecture ? `Second Reading: ${liturgyContent.secondLecture?.title} - ${liturgyContent.secondLecture?.content}` : ''}
      Gospel: ${liturgyContent.gospel?.title} - ${liturgyContent.gospel?.content}
    `.trim();

    // 1. Create a Thread
    const thread = await openai.beta.threads.create();

    // 2. Add the user's message (scriptures + request) to the Thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `
        Based on the following scripture readings for the day, please suggest songs from my uploaded song library for a Catholic Mass.
        The parts of the Mass to select songs for are: Entrance, Offertory, Communion, and Recessional.
        For each song, provide the title and a brief (1-2 sentences) reason for your choice.
        Format your response as a JSON object like this:
        {
          "entrance": { "title": "Song Title", "reason": "Why it fits..." },
          "offertory": { "title": "Song Title", "reason": "Why it fits..." },
          "communion": { "title": "Song Title", "reason": "Why it fits..." },
          "recessional": { "title": "Song Title", "reason": "Why it fits..." }
        }

        Today's Scripture Readings:
        ${scriptureText}
      `
      // If you have a vector store associated with your assistant for file search
      // you might not need to explicitly mention file_ids here if the assistant
      // is configured to use that vector store by default.
      // Otherwise, you might attach specific files to this message if needed,
      // or ensure the assistant is configured to use a vector store containing your songs.
    });

    // 3. Run the Assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: ASSISTANT_ID
      // Instructions here can override Assistant's default instructions
    });

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const assistantMessage = messages.data.find(
        (m) => m.role === 'assistant'
      );

      if (assistantMessage && assistantMessage.content[0]?.type === 'text') {
        const aiResponse = assistantMessage.content[0].text.value;
        try {
          // Attempt to extract JSON from the response
          // The AI might return text with JSON embedded, so you might need to parse carefully
          const jsonResponseMatch = aiResponse.match(
            /```json\n([\s\S]*?)\n```|({[\s\S]*})/
          );
          if (jsonResponseMatch) {
            const jsonString = jsonResponseMatch[1] || jsonResponseMatch[2];
            const playlistSuggestions = JSON.parse(jsonString);

            // 6. Store the newly generated playlist in Firebase
            try {
              await db
                .collection(PLAYLIST_COLLECTION)
                .doc(playlistDocId)
                .set(playlistSuggestions);
              console.log(
                `Stored new playlist for ${playlistDocId} in Firebase.`
              );
            } catch (dbError) {
              console.error(
                `Error storing playlist for ${playlistDocId} in Firebase:`,
                dbError
              );
              // Non-fatal, still return the playlist to the user
            }
            return res.status(200).json({ suggestions: playlistSuggestions });
          } else {
            console.error(
              'AI response did not contain expected JSON:',
              aiResponse
            );
            return res
              .status(500)
              .json({ error: 'AI response format error. Raw: ' + aiResponse });
          }
        } catch (e) {
          console.error(
            'Error parsing AI JSON response:',
            e,
            '\nRaw response:',
            aiResponse
          );
          return res.status(500).json({ error: 'Error parsing AI response.' });
        }
      } else {
        return res
          .status(500)
          .json({ error: 'No text response from assistant.' });
      }
    } else {
      console.error('Run did not complete:', run.status, run);
      return res
        .status(500)
        .json({ error: `Assistant run failed with status: ${run.status}` });
    }
  } catch (error: any) {
    console.error('Error generating AI playlist with Assistant:', error);
    res
      .status(500)
      .json({ error: `Failed to generate playlist. ${error.message}` });
  }
}

// You would still need fetchLecturesForDate
async function fetchLecturesForDate(date: string): Promise<any> {
  // ... (implementation as before or improved)
  // This is a placeholder.
  console.log('Fetching lectures for date:', date);
  // For now, return mock data or throw an error if not implemented
  // Example: const response = await fetch(`http://localhost:3000/api/lectures/${date}`);
  // const data = await response.json(); return data.content;
  // This needs to be properly implemented to fetch your lecture data
  return {
    firstLecture: {
      title: 'Mock First Reading',
      content: 'Content of first reading...'
    },
    psalm: { title: 'Mock Psalm', verses: ['Verse 1', 'Verse 2'] },
    gospel: { title: 'Mock Gospel', content: 'Content of gospel...' }
  };
}
