import os,json
from dotenv import load_dotenv
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import httpx 
import asyncio
from contextlib import asynccontextmanager

# load environment variables
load_dotenv(dotenv_path=os.path.join('..','server','.env'))


# Configuration
INDEX_FILE = 'jobs_faiss.index'
META_FILE = 'jobs_metadata.json'
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
TOP_K = 5

LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'gemini') 
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
HUGGINGFACEHUB_API_KEY = os.getenv('HUGGINGFACEHUB_API_KEY')

@asynccontextmanager
async def lifespan(app: FastAPI): 
    print(f"Loading models") 
    await load_models() 
    print(f"Models loaded successfully") 
    yield # Apllication runs here (between startup and shutdown)
    
    print(f"Shutting down! Bye...")

app = FastAPI( 
    title="Jobathon RAG API", 
    description="Career Copilot- AI powered job search assistant with multiple LLM supports", 
    version="1.0.0", 
    lifespan=lifespan # add lifespan handler
)

app.add_middleware( 
    CORSMiddleware, 
    allow_origins=["http://localhost:3000", "http://localhost:5000"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

class QueryRequest(BaseModel):
    query:str
    k: Optional[int] = TOP_K
    llm_provider: Optional[str] = None # Override default provider

class JobResult(BaseModel):
    id: str
    title: str
    company: str
    location: str
    type: str
    experience: str  
    category: str
    score: float

class QueryResponse(BaseModel):
    success: bool
    answer : str   # AI generated response
    jobs: List[JobResult] # list of matching jobs 
    total_jobs: int 
    llm_provider: str

# Why use Pydantic ? Auto generates API docs. Type safety. Automatic data validation

embedding_model = None
faiss_index = None
job_metadata = None

 

class LLMProvider: 
    async def gen_res(self, system_support: str, user_prompt: str)-> str: 
        raise NotImplementedError

class GeminiProvider(LLMProvider): 
    def __init__(self, api_key: str): 
        self.name = "gemini"
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

    async def gen_res(self, sys_prompt: str, user_prompt: str) -> str: 
        if not self.api_key:
            raise ValueError("Gemini key not provided")

        combined_prompt = f"{sys_prompt}\n\nUser Query: {user_prompt}\n\nResponse:"

        payload = { 
            "contents": [ { 
                "parts": [{"text": combined_prompt}]
            }],
            "generationConfig": { 
                "temperature": 0.3, 
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 500, 
            }
        }

        headers = { 
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient() as client: 
            res = await client.post(
                f"{self.base_url}?key={self.api_key}",
                json=payload,
                headers=headers, timeout=30.0
            )

            if res.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Gemini API error: {res.text}")
            result = res.json()
            
            if 'candidates' in result and len(result['candidates']) > 0: 
                return result['candidates'][0]['content']['parts'][0]['text'].strip()
            else: 
                raise HTTPException(status_code=500, detail ="No response from GEMINI")



class HuggingFaceProvider(LLMProvider):
    def __init__(self, api_key:str): 
        self.name = "huggingface" 
        self.api_key = api_key
        self.base_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"

    async def gen_res(self, sys_pro: str, user_pro : str)->str: 
        if not self.api_key: 
            raise ValueError("Huggingface api key not provided") 
        comb_pro = f"{sys_pro}\n\nUser: {user_pro}\nAssistant:" 
        
        payload = { 
            "inputs": comb_pro, 
            "parameters": { 
                "max_new_tokens": 500, 
                "temperature": 0.3, 
                "do_sample": True 
            }
        }

        headers = { 
            "Authorization": f"Bearer {self.api_key}", 
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient() as client: 
            res = await client.post(
                self.base_url, 
                json=payload, 
                headers = headers, 
                timeout=30.0
            )

            if res.status_code != 200: 
                raise HTTPException(status_code=500, detail=f"Huggingface API error: {res.text}")
            
            result = res.json() 
            if isinstance(result, list) and len(result) > 0: 
                return result[0].get('generated_text', '').replace(comb_pro, '').strip() 
            return 'No response generated from Huggingface'
        

def getLLMProvider(name: str = None) -> LLMProvider: 
    if name is None:  
        name = LLM_PROVIDER
    if name.lower() == 'gemini':
        return GeminiProvider(GEMINI_API_KEY)
    elif name.lower() == 'huggingface':
        return HuggingFaceProvider(HUGGINGFACEHUB_API_KEY)
    else:
        raise ValueError(f"Unsupported LLM provider: {name}")
    
async def load_models(): 
    """Load embedding model, FAISS index"""
    ## why global ? 
    ## because we want to use the loaded models in the API endpoints
    global embedding_model, faiss_index, job_metadata

    try: 
        # load embedding model
        embedding_model = SentenceTransformer(EMBEDDING_MODEL)

        # load FAISS index
        if os.path.exists(INDEX_FILE):
            faiss_index = faiss.read_index(INDEX_FILE)
            print(f"FAISS index loaded from '{INDEX_FILE}' with {faiss_index.ntotal} vectors.")
        else: 
            print(f"FAISS index file '{INDEX_FILE}' not found.")
            faiss_index = None

        # load job metadata
        if os.path.exists(META_FILE):
            with open(META_FILE, 'r', encoding='utf-8') as f:
                job_metadata = json.load(f)
            print(f"Job metadata loaded from '{META_FILE}' with {len(job_metadata)} records.")
        else: 
            print(f"Job metadata file '{META_FILE}' not found.")
            job_metadata = None
        
    except Exception as e: 
        print(f"Error loading models: {e}")
        raise e 
    

async def searchSimilarJobs(query: str, k : int = TOP_K) -> List[dict]: 
    """Search similar jobs using FAISS index"""
    if faiss_index is None or job_metadata is None: 
        raise HTTPException(status_code=500, detail="FAISS index or job metadata not loaded")
        

    try: 
        query_emb = embedding_model.encode([query], convert_to_numpy = True) 
        query_emb = query_emb.astype('float32')


        Scores, Indices = faiss_index.search(query_emb, k)

        res = [] 
        for i, (score, idx) in enumerate(zip(Scores[0], Indices[0])): 
            if idx < len(job_metadata): 
                job = job_metadata[idx].copy()
                job['score'] = float(score)
                res.append(job)

        return res

    except Exception as e: 
        print(f"Error in searching similar jobs: {e}")
        raise HTTPException(status_code=500, detail=f"Error in searching similar jobs: {str(e)}") 
        


def create_sys_pro()-> str: 
    """Create a system prompt for LLM"""

    return """You are Career Copilot, an AI assistant that helps users find relevant job opportunities based on their queries.
    You have access to a list of job postings with details such as job title, company, location, type, experience level, and category.
    Use the provided job details to answer user queries accurately and helpfully. Also format your respones in a friendly and professional
    manner."""


async def gen_ai_res(query: str, jobs: List[dict], llm_provider : str) -> str: 
    """Generate AI responses using the specified LLM provider"""

    try: 
        provider = getLLMProvider(llm_provider)
        sys_pro = create_sys_pro()


        jobs_context = "" 
        if jobs: 
            jobs_context = "\n\nHere are some relevant job postings:\n"
            for i, job in enumerate(jobs[:3], 1): 
                jobs_context += f"{i}. {job.get('title','N/A')} at {job.get('company','N/A')}\n"
                jobs_context += f" Location: {job.get('location','N/A')}\n"
                jobs_context += f" Experience: {job.get('experience','N/A')}\n"
                jobs_context += f" Type: {job.get('type','N/A')}\n\n"

        else: 
            jobs_context = "\n\nNo relevant job postings found."

        user_pro = f"User's query : {query} \n{jobs_context}\nBased on the above job postings, provide a concise and helpful response to the user's query."

        if hasattr(provider, 'gen_res'):  
            res = await provider.gen_res(sys_pro, user_pro)
        
        else : 
            res = f"I found {len(jobs)} relevant jobs for the query: {query}"

        return res 
    except Exception as e: 
        print(f"Error in generating AI response: {e}")
        return f"I found {len(jobs)} relevant jobs, but encountered an error while generating a detailed response."
    

@app.post("/search", response_model = QueryResponse) 
async def search_jobs(request: QueryRequest): 
    """Main RAG endpoint to search jobs and generate AI response"""

    try: 
        # search for similar jobs
        sim_jobs = await searchSimilarJobs(request.query, request.k)

        jobs_res = [] 

        for job in sim_jobs: 
            job_res = JobResult( 
                id = str(job.get('id', job.get('_id', ''))), 
                title = job.get('title', ''), 
                company = job.get('company', ''), 
                location= job.get('location', ''), 
                type = job.get('type', ''),
                experience = job.get('experience', ''),
                category = job.get('category', ''),
                score = job.get('score', 0.0)
            )
            jobs_res.append(job_res)

        providerName = request.llm_provider or LLM_PROVIDER

        ai_res = await gen_ai_res(request.query, sim_jobs, providerName)

        return QueryResponse(
            success = True, 
            answer=ai_res,
            jobs = jobs_res,
            total_jobs = len(jobs_res),
            llm_provider = providerName
        )
    
    except Exception as e: 
        print(f"Error in /search endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"{str(e)}")
    

@app.get("/health")
async def health_check(): 
    """Health check endpoint"""
    return { 
        "status": "healthy", 
        "models_loaded": { 
            "embedding_model": embedding_model is not None, 
            "faiss_index": faiss_index is not None, 
            "job_metadata": job_metadata is not None
        }, 
        "total_jobs": len(job_metadata) if job_metadata else 0
    }


@app.get("/") 
async def root(): 
    """Root endpoint"""

    return { 
        "message" : "JOBATHON RAG API - CAREER COPILOT",
        "version": "1.0.0",
        "endpoints" : { 
            "/search": "POST - Search jobs and get AI response", 
            "/health": "GET - Health check",
        }
    }

if __name__ == "__main__": 
    import uvicorn
    import sys


    # check if --reload flag is passed 
    if "--reload" in sys.argv: 
        print("Starting with reload using import string...") 
        uvicorn.run(
            "RAG_Server:app", # Import string format
            host = "localhost",
            port= 8000, 
            reload = True
        )
    else: 
        print("Startin in production mode") 
        uvicorn.run(app, host = "localhost", port = 8000) 


## what is uvicorn ? ASGI server (like apache/nginx but for python async apps) 
## It is like the server that houses the code/ fastapi app
#  alternatives to uvicorn are: Guicorn, Hypercorn, Daphne 
#  uvicorn is fast ( built in Rust/C), built in reload 