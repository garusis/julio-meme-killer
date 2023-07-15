# Julio Meme Killer

## Description

`julio-meme-killer` is a Web Crawler designed to monitor chatrooms for memes of Julio Iglesias. Upon detection, it will automatically delete these memes to ensure a julio-free chatting experience.

## Features

- Utilizes Web Crawling techniques to track memes in chat.
- Uses image processing and facial recognition to identify Julio Iglesias memes.
- Automatically removes detected memes from chatrooms.

## Requirements

- Node.js installed on your machine.
- AWS account and credentials with AmazonRekognitionFullAccess permissions or enough permissions to use [Rekognition.compareFaces](https://docs.aws.amazon.com/rekognition/latest/dg/faces-comparefaces.html)

## Installation

To install this project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/your_username/julio-meme-killer.git
```

2. Change directory to the cloned repository:

```bash
cd julio-meme-killer
```

3. Install the necessary packages:

```bash
npm install
```

4. Set the enviroment variables:

```bash
cp template.env .env
```

In the .env file replace the values by your AWS credentials.

## Usage

To run the julio-meme-killer:

```bash
npm start
```

This command will start the Web Crawler and begin monitoring your specified chats for Julio Iglesias memes.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
