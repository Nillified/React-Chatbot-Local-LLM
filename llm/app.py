import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

class QueryRequest(BaseModel):
    prompt: str

# Expand the tilde to get the full path.
model_dir = os.path.expanduser("~/.ollama/models/qwen")
# Load the tokenizer and model from the local directory.
tokenizer = AutoTokenizer.from_pretrained(model_dir, local_files_only=True)
model = AutoModelForCausalLM.from_pretrained(model_dir, local_files_only=True)

@app.post("/query")
async def query_model(request: QueryRequest):
    try:
        inputs = tokenizer(request.prompt, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=100)
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
