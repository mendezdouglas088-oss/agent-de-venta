import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OllamaService {
  async embed(text: string): Promise<number[]> {
    const res = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
    });

    const data = await res.json();
    return data.embedding;
  }

  async text(prompt: string): Promise<string> {
    const res = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'llama3:8b', // el modelo que tengas corriendo
        prompt: prompt,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    return res.data.response;
  }
}
