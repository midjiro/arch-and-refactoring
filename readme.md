# Cinema booking backend

## Technologies

![](https://img.shields.io/badge/Express-20232A?style=for-the-badge&logo=Express&logoColor=fff)
![](https://img.shields.io/badge/GoogleCloud-20232A?style=for-the-badge&logo=googlecloud&logoColor=4285F4)
![](https://img.shields.io/badge/MongoDB-20232A?style=for-the-badge&logo=mongoDB&logoColor=47A248)
![](https://img.shields.io/badge/Passport-20232A?style=for-the-badge&logo=passport&logoColor=34E27A)

## Description

Node.js module that provides API for authorization and booking tickets.

## Installation

Before start ensure you set GCP Account (OAuth2.0, Service Account), MongoDB cluster, Google app password.

- Clone Repository

  `git clone https://github.com/midjiro/arch-and-refactoring.git`

- Go to cloned repo and install deps both for client and server

  `npm install`

- In the root of the server define the following env variables

        GOOGLE_CLIENT_ID  = "..."
        GOOGLE_CLIENT_SECRET = "..."
        GOOGLE_CALLBACK_URL = "..."
        MONGO_URI = "..."
        PORT = 5001

- You are ready to start working with project locally

  `npm run dev`

Swagger endpoint: http://localhost:4000/docs

## Contact

Hulak Mykhailo

[Send me an email](miha.gulak@gmail.com)

[Find me on telegram](https://t.me/@midjiro)

## Usefull information

- [How to setup GCP OAuth2.0](https://www.youtube.com/watch?v=HtJKUQXmtok)
