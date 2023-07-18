# Judge0 API Clone

This project is a Judge0 API Clone, which aims to replicate the functionality of the Judge0 API. It provides a powerful API endpoint that allows users to submit their code and receive the corresponding output. Additionally, the API ensure secure access.

## Features
- Code Submission: Users can submit their code snippets through the API for execution and evaluation.
- Language Support: The API supports multiple programming languages, allowing users to write code in their preferred language.
- Output Retrieval: The submitted code is executed, and the output is returned to the user.
- Authentication: A secure authentication mechanism is implemented to protect the API from unauthorized access.
- Scalability: The API is designed to handle a high volume of concurrent requests efficiently.
- Error Handling: Comprehensive error handling is implemented to provide meaningful feedback to users in case of issues.

## Getting Started

### Prerequisites

Make sure you have the following software installed:

- [Docker](https://www.docker.com/) - Used for containerization of the application.
  - [node](https://hub.docker.com/_/node)
  - [gcc](https://hub.docker.com/_/gcc)
  - [rabbitmq](https://hub.docker.com/_/rabbitmq)
- [Node.js](https://nodejs.org/) - JavaScript runtime environment.
- [MongoDB](https://www.mongodb.com/) - Database

### Installation

1. Clone the repository to your local machine:
   ```shell
   git clone git@github.com:Paras0750/Judge0-Clone.git
   ```

2. Navigate to the project directory:
   ```shell
   cd Judge0-Clone
   ```

3. Install the required dependencies:
   ```shell
   npm install
   ```
   
4. Pull docker images:
   ```shell
   docker pull node
   docker pull gcc
   docker pull rabbitmq
   ```
5. Start rabbitmq container on port 5672:
    ```shell
   docker run --name rabitMQ -p 5672:5672 rabbitmq
   ```
6. Fill up environment variable (.env)
    ```shell
    PORT = 3000
    MONGO_URI = 'mongodb://localhost:27017/judge0-api'
    JWT_SECRET_KEY = 'secretKey'
   ```

## API Endpoints

- `POST /auth/register`: Register a new user account.
- `POST /auth/login`: Login with user credentials.
- `POST /code/submissions`: Create a new code submission.

## Authentication

To access the Judge0 API Clone, you need to authenticate yourself using the following steps:

1. Register a new user account by sending a POST request to the `/auth/register` endpoint with the required user details.

2. Obtain an authentication token by sending a POST request to the `/auth/login` endpoint with your registered user credentials.

3. Include the obtained authentication token in the `x-auth-token` header of your subsequent API requests.

## Load Test

- Install loadtest using npm
  ```
  npm i --save-dev loadtest
  ```
- Test the server
  
  - [Authenticate user](#authentication) and get the `x-auth-token`
    
  - Make sure to replace `<token>` with the actual authentication token when you use the command.
    
  
  ```
  loadtest -n 1000 -c 100 -H x-auth-token:<token> --data '{"userSubmittedCode": "let sum = 0; for(let i=0;i<10;i++){sum+=1} console.log(sum);", "codeLanguage": "js"}' -T 'application/x-www-form-urlencoded' -m POST http://localhost:3000/code/submissions
  ```
## Contact

If you have any questions or suggestions regarding this project, please feel free to reach out to the project maintainer at nauriyalparas0@gmail.com.

Thank you for your interest in this Judge0 API Clone project!
