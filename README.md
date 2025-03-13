# Simple Chatbot with Ollama LLM

This is a simple chatbot utilizing the local Ollama LLM model, specifically configured to use **QWEN-0.5B**.

## Requirements
- Knowledge of **Docker**
- Familiarity with **React.js**

## Setup and Deployment
### 1. Deploy the Ollama LLM Model with Docker
Ensure that you have Docker installed and running. Then, build and run the Ollama LLM model container:

#### Dockerfile Overview
The `Dockerfile` uses a **Python 3.9 slim** base image and sets up the environment for running the chatbot. It installs dependencies, copies the model files, and runs a **Uvicorn API server**. Key steps include:

- Installing required dependencies from `requirements.txt`
- Copying the **Qwen model files** into the correct location inside the container
- Exposing port **8000**
- Running the API server with `uvicorn`

#### Build and Run the Docker Container
```sh
# Build the Docker image
docker build -t chatbot-ollama .

# Run the container
docker run -d -p 8000:8000 chatbot-ollama
```

### 2. Deploy the React Project
Clone this repository and install dependencies:
```sh
git clone https://github.com/your-repo/simple-chatbot.git
cd simple-chatbot
npm install
```
Ensure that the **API call in `page.tsx`** correctly points to the running Docker container.

Start the React application:
```sh
npm run dev
```

## Usage
Once both the LLM model and React frontend are running, open your browser and navigate to `http://localhost:3000`. The chatbot should be ready to interact with you!

## Contributing
Feel free to fork this repository and submit pull requests if you want to improve the project.
