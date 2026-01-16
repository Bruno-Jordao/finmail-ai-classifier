
import { EmailCategory, EmailClassification } from "../types";

// URL da API do back-end Python
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const classifyEmail = async (emailContent: string): Promise<EmailClassification> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: emailContent,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Erro HTTP: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usar o texto da resposta
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    return {
      ...result,
      category: result.category === "Produtivo" ? EmailCategory.PRODUTIVO : EmailCategory.IMPRODUTIVO
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Não foi possível conectar ao servidor. Verifique se o back-end está rodando em http://localhost:8000");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao classificar email. Verifique se o servidor está rodando.");
  }
};
