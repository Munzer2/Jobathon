import json,os 
from sentence_transformers import SentenceTransformer
import faiss 
import numpy as np
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join('..', 'server', '.env'))


#Configuration
MODEL_NAME = 'all-MiniLM-L6-v2'  # You can choose other models from the sentence-transformers library
JOBS_FILE = 'jobs.json'
INDEX_FILE = 'jobs_faiss.index'
META_FILE = 'jobs_metadata.json'

def job_to_text(job):
    """Convert a job dict to a single text string for embedding."""
    parts = []

    # add core job infos 
    if job.get('title'):
        parts.append(f"Job Title: {job['title']}")
    if job.get('company'):
        parts.append(f"Company: {job['company']}")
    if job.get('location'):
        parts.append(f"Location: {job['location']}")
    if job.get('type'):
        parts.append(f"Type: {job['type']}")
    if job.get('experience'):
        parts.append(f"Experience: {job['experience']}")
    if job.get('category'):
        parts.append(f"Category: {job['category']}")
    if job.get('description'):
        parts.append(f"Description: {job['description']}")
    if job.get('requirements') and isinstance(job['requirements'], list): 
        parts.append(f"Requirements: {' '.join(job['requirements'])}")
    if job.get('skills') and isinstance(job['skills'], list): 
        parts.append(f"Skills: {' '.join(job['skills'])}")
    if job.get('benefits') and isinstance(job['benefits'], list):
        parts.append(f"Benefits: {' '.join(job['benefits'])}")
    if job.get('salary') and isinstance(job['salary'], dict):
        salary = job['salary']
        if salary.get('min') and salary.get('max'):
            parts.append(f"Salary Range: ${salary['min']:,} to {salary['max']:,}")
    return "\n".join(parts)

def gen_embeddings(): 
    " Generate embeddings for jobs and save to FAISS index."
    print("Starting embedding generation...")

    # check if job file exists
    if not os.path.exists(JOBS_FILE):
        print(f"Jobs file {JOBS_FILE} not found!")
        return False
    
    # Load jobs
    print(f"Loading jobs from {JOBS_FILE}...")
    with open(JOBS_FILE, 'r', encoding='utf-8') as f:
        jobs = json.load(f)

    if not jobs:
        print("No jobs found in the jobs file.")
        return False
    print(f"Loaded {len(jobs)} jobs.")

    job_texts = [] 
    metadata = []

    for i, job in enumerate(jobs): 
        try: 
            text = job_to_text(job)
            job_texts.append(text)
            metadata.append({
                'id': str(job.get('_id', '')),
                'title': job.get('title', ''),
                'company': job.get('company', ''),
                'location': job.get('location', ''),
                'type': job.get('type', ''),
                'experience': job.get('experience', ''),
                'category': job.get('category', '')
            })

            if (i + 1)%50 == 0: 
                print(f"Processed {i+1}/{len(jobs)} jobs...")
        except Exception as e:
            print(f"Error processing job {i}: {e}")
            continue
    # Load the embedding model

    print(f"Loading model {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)

    #generate embeddings

    print("Generating embeddings...")

    embeddings = model.encode(
        job_texts, 
        show_progress_bar=True, 
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    print(f"Generated embeddings with shape: {embeddings.shape}")

    # Create FAISS index 
    print(f"Creating FAISS index...")
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # Using Inner Product (dot product) for cosine similarity with normalized vectors
    index.add(embeddings.astype('float32'))  # FAISS requires float32

    # save FAISS index
    print(f"Saving FAISS index to {INDEX_FILE}...")
    faiss.write_index(index, INDEX_FILE)

    # save metadata
    with open(META_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"Saved metadata to {META_FILE}")

    print("Embedding generation completed.")
    print(f"Embedding dimension: {dim}")
    print(f"Files created: ")
    print(f" - {INDEX_FILE}")
    print(f" - {META_FILE}")
    return True


if __name__ == '__main__':
    success = gen_embeddings()
    if not success:
        print("Failed to generate embeddings.")
        exit(1)