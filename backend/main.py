from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import os
from dotenv import load_dotenv
from groq import Groq
import json
import logging
import time

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

app = FastAPI(title="FinMail AI Classifier API")

# Configurar CORS para permitir requisições do front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar API Key do Groq
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY não encontrada nas variáveis de ambiente. "
                     "Obtenha sua chave em: https://console.groq.com/keys")

# Inicializar cliente Groq
client = Groq(api_key=api_key)

DEFAULT_MODEL = "llama-3.1-70b-versatile"

class EmailRequest(BaseModel):
    content: str

class EmailClassification(BaseModel):
    category: Literal["Produtivo", "Improdutivo"]
    reason: str
    summary: str
    suggestedResponse: str
    priority: Literal["Baixa", "Média", "Alta"]
    sentiment: Literal["Positivo", "Neutro", "Negativo"]


@app.get("/api/models")
def list_available_models():
    """
    Lista os modelos disponíveis no Groq.
    """
    available_models = [
        {
            "name": "llama-3.1-70b-versatile",
            "display_name": "Llama 3.1 70B Versatile",
            "description": "Modelo versátil e poderoso, ideal para tarefas complexas"
        },
        {
            "name": "llama-3.1-8b-instant",
            "display_name": "Llama 3.1 8B Instant",
            "description": "Modelo rápido e leve, ideal para respostas rápidas"
        },
        {
            "name": "mixtral-8x7b-32768",
            "display_name": "Mixtral 8x7B",
            "description": "Modelo de mistura de especialistas, muito eficiente"
        },
        {
            "name": "gemma2-9b-it",
            "display_name": "Gemma 2 9B",
            "description": "Modelo Google Gemma 2, otimizado para instruções"
        }
    ]
    return {"available_models": available_models, "provider": "Groq"}

@app.post("/api/classify", response_model=EmailClassification)
async def classify_email(request: EmailRequest):
    """
    Classifica um email corporativo do setor financeiro.
    """
    logger.info(f"Recebida requisição para classificar email (tamanho: {len(request.content)} caracteres)")
    try:
        model_names = [
            "llama-3.1-70b-versatile",  
            "llama-3.1-8b-instant",      
            "mixtral-8x7b-32768",       
            "gemma2-9b-it",   
        ]
        
        model_name_used = DEFAULT_MODEL  
        
        prompt = f"""Analise o seguinte email corporativo do setor financeiro e classifique-o.

Email:
\"\"\"
{request.content}
\"\"\"

Critérios:
- PRODUTIVO: Requer ação ou resposta específica (ex: suporte, status, dúvidas, envio de arquivos).
- IMPRODUTIVO: Mensagens de felicitações, agradecimentos genéricos ou irrelevantes.

Retorne APENAS um objeto JSON válido (sem markdown, sem texto adicional) com os seguintes campos:
{{
  "category": "Produtivo" ou "Improdutivo",
  "reason": "Breve explicação do porquê desta classificação",
  "summary": "Um resumo de 1 linha do conteúdo do email",
  "suggestedResponse": "Uma resposta profissional sugerida para este email",
  "priority": "Baixa", "Média" ou "Alta",
  "sentiment": "Positivo", "Neutro" ou "Negativo"
}}

IMPORTANTE: Retorne APENAS o JSON, sem markdown, sem explicações adicionais. Use Português do Brasil."""

        max_retries = 3
        retry_delay = 1  
        
        response_text = None
        last_error = None
        
        for attempt in range(max_retries):
            try:
                # Tentar cada modelo até encontrar um que funcione
                for model_name in model_names:
                    try:
                        logger.info(f"Tentando modelo: {model_name} (tentativa {attempt + 1}/{max_retries})")
                        
                        # Chamar API do Groq
                        chat_completion = client.chat.completions.create(
                            messages=[
                                {
                                    "role": "system",
                                    "content": "Você é um assistente especializado em análise de emails corporativos. Sempre retorne apenas JSON válido, sem markdown."
                                },
                                {
                                    "role": "user",
                                    "content": prompt
                                }
                            ],
                            model=model_name,
                            temperature=0.3,  
                            response_format={"type": "json_object"}  
                        )
                        
                        response_text = chat_completion.choices[0].message.content
                        model_name_used = model_name
                        logger.info(f"✅ Resposta recebida do Groq usando modelo: {model_name}")
                        break
                    except Exception as model_error:
                        error_str = str(model_error)
                        
                        if "404" in error_str or "not found" in error_str.lower() or "model" in error_str.lower():
                            logger.warning(f"⚠️ Modelo {model_name} não disponível: {error_str[:100]}")
                            continue
                        else:
                            raise
                
                if response_text:
                    break
                    
            except Exception as e:
                error_str = str(e)
                last_error = e
                
                if "429" in error_str or "rate limit" in error_str.lower() or "quota" in error_str.lower():
                    if attempt < max_retries - 1:
                        retry_seconds = retry_delay * (attempt + 1)
                        logger.warning(f"Rate limit atingido (tentativa {attempt + 1}/{max_retries}). Aguardando {retry_seconds}s...")
                        time.sleep(retry_seconds)
                        continue
                    else:
                        raise HTTPException(
                            status_code=429,
                            detail=f"Limite de uso atingido. Por favor, aguarde alguns segundos antes de tentar novamente. "
                                   f"Modelo usado: {model_name_used}. "
                                   f"Para mais informações: https://console.groq.com/docs/rate-limits"
                        )
                else:
                    if attempt < max_retries - 1:
                        logger.warning(f"Erro na tentativa {attempt + 1}: {error_str[:150]}. Tentando novamente...")
                        time.sleep(retry_delay)
                        continue
                    else:
                        raise
        
        if not response_text:
            raise HTTPException(
                status_code=500,
                detail=f"Não foi possível obter resposta. Último erro: {str(last_error)}"
            )
        
        response_text = response_text.strip()
        logger.info(f"Resposta recebida do Groq (primeiros 200 chars): {response_text[:200]}")
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        logger.info(f"Classificação bem-sucedida: {result.get('category', 'N/A')}")
        
        # Validar e retornar
        return EmailClassification(**result)
        
    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        error_msg = f"Erro ao processar resposta JSON da API: {str(e)}"
        if 'response_text' in locals() and response_text:
            error_msg += f" | Resposta recebida: {response_text[:200]}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except ValueError as e:
        logger.error(f"Erro de validação: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro de validação: {str(e)}")
    except Exception as e:
        error_detail = str(e)
        logger.error(f"Erro na classificação: {error_detail}", exc_info=True)
        
        # Verificar se é erro de quota/rate limit
        if "429" in error_detail or "quota" in error_detail.lower():
            raise HTTPException(
                status_code=429,
                detail=f"Limite de uso gratuito excedido. Aguarde alguns minutos. "
                       f"Detalhes: {error_detail[:200]}"
            )
        
        raise HTTPException(status_code=500, detail=f"Erro na classificação: {error_detail}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# === SERVIR FRONT-END ===

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "dist"

if FRONTEND_DIST.exists():
    app.mount(
        "/",
        StaticFiles(directory=FRONTEND_DIST, html=True),
        name="frontend"
    )

