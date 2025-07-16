# Mint-domain-pharos
Tool Auto Mint Domain Pharos Testnet


Guide: Domain Tool Setup and Usage
Prerequisites
Please ensure you have Node.js installed on your system.

Installation
First, you need to install the necessary modules. Open your terminal or command prompt in the project directory and run the following command:

Bash

npm install
Configuration
1. Private Key Setup
Create a file named wallet.txt in the root directory of your project. Paste your wallet's private key into this file.

2. Rental Duration
The code is currently set to rent domains for 5 years by default. If you wish to reduce this duration to make the domain cheaper, find line 10 in your code (likely in dm.js) and change the RENT_YEARS value to 3 or 1.

JavaScript

RENT_YEARS: 5, // Default rental duration in years
Running the Tool
Once you've completed the setup, you can run the tool using the following command:

Bash

node dm.js

GOOD LOOK!!!
