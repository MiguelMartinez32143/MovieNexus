const fs = require('fs');
const path = require('path');

// Manualmente parseamos el archivo .env si estamos en entorno local y la variable no está definida.
if (!process.env.GEMINI_API_KEY) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value.trim();
        }
      }
    }
  } catch (e) {
    console.error('Error al leer el archivo .env:', e);
  }
}

module.exports = async function handler(req, res) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  const { message, history } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'El mensaje es requerido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'La variable de entorno GEMINI_API_KEY no está configurada.' });
  }

  try {
    // Preparar el historial de contenidos para Gemini
    const contents = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{
            text: msg.role === 'model'
              ? JSON.stringify({ response: msg.text, movies: msg.movies || [] })
              : msg.text
          }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [
              {
                text: "Eres un asistente de chat cinéfilo apasionado y experto en el séptimo arte. Tu personalidad es la de un crítico y entusiasta del cine. Debes responder las preguntas del usuario con un tono amigable, dinámico y lleno de referencias cinematográficas. Analizas aspectos técnicos, directores, actores, géneros o bandas sonoras cuando sea relevante. Debes proporcionar siempre una salida estructurada en JSON con la respuesta conversacional en 'response' y los títulos exactos de las películas recomendadas o mencionadas en 'movies', asegurate de no abrumar al usuario con emojis ni texto largo, directo al punto."
              }
            ]
          },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                response: {
                  type: 'STRING',
                  description: 'La respuesta conversacional con personalidad de crítico y entusiasta del cine.'
                },
                movies: {
                  type: 'ARRAY',
                  items: {
                    type: 'STRING'
                  },
                  description: 'Títulos exactos de las películas mencionadas o recomendadas en la respuesta. Si no se mencionan películas, dejar la lista vacía.'
                }
              },
              required: ['response', 'movies']
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de la API de Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!geminiText) {
      throw new Error('No se recibió contenido de Gemini.');
    }

    const result = JSON.parse(geminiText);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en el handler de chat:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
};
