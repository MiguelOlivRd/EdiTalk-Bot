from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import importlib
import prompt
import call_model_dell
from langchain_community.embeddings import HuggingFaceEmbeddings
from scipy.spatial.distance import cosine

# Reload modules
importlib.reload(prompt)
importlib.reload(call_model_dell)

prompt = prompt.prompt
call_model = call_model_dell.call_model
# Load required data
with open("representative_questions.json", "r", encoding="utf-8") as f:
    representative_questions = json.load(f)

with open("edital_name_to_file_path.json", "r", encoding="utf-8") as f:
    edital_name_to_file_path = json.load(f)["editais"]

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Vector creation for question matching
vector_to_edital = []
for edital in representative_questions["editais"].keys():
    for question in representative_questions["editais"][edital]:
        vector = embeddings.embed_query(question)
        vector_to_edital.append((vector, edital))

def find_edital_by_question(question):
    question_vector = embeddings.embed_query(question)
    closest_edital = None
    similarities = []

    for vector, edital in vector_to_edital:
        cos_sim = 1 - cosine(question_vector, vector)
        similarities.append((cos_sim, edital))
    
    similarities.sort(reverse=True)
    editais_count = {}
    for similarity in similarities[:5]:
        edital = similarity[1]
        if edital in editais_count:
            editais_count[edital] += 1
        else:
            editais_count[edital] = 1

    if similarities[0][0] > 0.9:
        return similarities[0][1]

    max_count = -1
    max_edital = None
    for edital, value in editais_count.items():
        if value > max_count:
            max_count = value
            max_edital = edital

    return max_edital

def get_edital_file_content(edital_name):
    """
    Given the name of an edital, returns its content as a string.
    """
    file_path = edital_name_to_file_path[edital_name]
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

def answer_question(question):
    edital_name = find_edital_by_question(question)
    edital_content = get_edital_file_content(edital_name)

    full_prompt = prompt(edital_content, question)

    answer = call_model_dell.call_model(full_prompt)

    return answer, edital_name

# FastAPI setup
app = FastAPI()

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str
    edital_name: str

@app.post("/", response_model=AnswerResponse)
async def chat(request: QuestionRequest):
    try:
        question = request.question
        answer, edital_name = answer_question(question)
        return AnswerResponse(answer=answer, edital_name=edital_name)
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# To run the server, use: uvicorn filename:app --reload
