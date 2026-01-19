import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Service responsible for interacting with Google Gemini API.
 * Generates summaries and sales insights based on lead data.
 */
@Injectable()
export class LeadsAiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Using the specific model version defined for this project
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  }

  /**
   * Generates a professional summary and a next action suggestion for a given lead.
   * @param leadName Name of the potential client.
   * @param leadEmail Email of the potential client.
   * @returns A parsed JSON object containing { summary, next_action }.
   */
  async generateSummary(leadName: string, leadEmail: string) {
    const prompt = `
      Eres un asistente experto en ventas CRM. Analiza el siguiente lead:
      Nombre: ${leadName}
      Email: ${leadEmail}

      Genera un resumen profesional y sugiere una próxima acción de venta.
      
      IMPORTANTE: Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta, sin texto extra ni bloques de código markdown:
      {
        "summary": "Aquí el resumen del perfil...",
        "next_action": "Aquí la acción sugerida..."
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Sanitize response: remove markdown code blocks to ensure valid JSON parsing
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Error connecting to Gemini API:', error);
      
      // Fallback response to prevent application crash on AI service failure
      return {
        summary: 'No se pudo generar el resumen por ahora.',
        next_action: 'Revisar manualmente.',
      };
    }
  }
}