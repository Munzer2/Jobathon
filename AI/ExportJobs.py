from pymongo import MongoClient
import json,os 
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join('..','server','.env'))
MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/jobathon"

def export_jobs(out_path='jobs.json', limit=1000):
    try: 
        client = MongoClient(MONGO_URI)
        # db = client.get_default_database()
        # print("Available databases:", client.list_database_names())

        db = client['jobathon']
        jobs = list(db.jobs.find(
            { 'isActive': True }, ## Only export active jobs
            { 
                '_id': 1, 'title': 1,
                'company': 1, 'description':1, 
                'requirements': 1, 'skills':1, 
                'location':1, 'type':1, 
                'experience':1, 'salary':1, 
                'category':1, 'benefits': 1
            }
        ).limit(limit))

        for job in jobs: 
            job['_id'] = str(job['_id']) # convert objectId to String
        
        print(f"Found {len(jobs)} jobs to {out_path}")

        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(jobs, f, ensure_ascii=False, indent=2)

        print(f"Exported {len(jobs)} jobs to {out_path}")

        cats = {} 
        types = {} 
        for job in jobs:
            cat = job.get('category', 'Unknown')
            typ = job.get('type', 'Unknown')
            cats[cat] = cats.get(cat,0)+1 
            types[typ] = types.get(typ,0)+1

        print("\n Job Categories:")
        for cat, count in sorted(cats.items()):
            print(f"   {cat}: {count}")
            
        print("\n Job Types:")
        for typ, count in sorted(types.items()):
            print(f"   {typ}: {count}")
            
        client.close()
        return len(jobs)
    except Exception as e:
        print(f"Error exporting jobs: {e}")
        return 0
    
if __name__ == '__main__': 
    export_jobs()
