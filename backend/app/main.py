from ollama import chat
''' 
Start the ollama model in terminal using the following command: ollama serve
then run this python script to get the response from the model.

For running debuggin drill
go to frontend run npm run dev
start ollama ollama serve , if we got error
go inside venv using venv\Scripts\activate.bat
go to backend and run uvicorn main:app --reload --host 127.0.0.1 --port 8000
'''
response = chat(
    model="qwen2.5-coder:3b",
    messages=[
        {"role": "user", "content": "Consider yourself as karat interviewer , kindly ask me 3 de-bugging program questions in java hashmap."}
    ]
)

print(response["message"]["content"])
