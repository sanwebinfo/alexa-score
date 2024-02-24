#!/bin/bash

# Load ENV Variables
. .env

## Progress Bar
progress_bar() {
    local total_steps=40
    local width=25
    for ((i=0; i<=${total_steps}; i++)); do
        percentage=$((i * 100 / total_steps))
        progress=$((i * width / total_steps))
        printf "\r[%-${width}s] %d%%" $(printf "+%.0s" $(seq 1 ${progress})) ${percentage}
        sleep 0.1
    done
    echo -ne "\r\033[2K"
}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Emojis
SUCCESS_EMOJI="✅"
ERROR_EMOJI="❌"
TOKEN_EMOJI="🔑"
INFO_EMOJI="ℹ️"

# Function to get token
get_token() {
    token_url="$API_URL/token"
    api_key=$API

    # Requesting token and checking HTTP status code
    http_code=$(curl --silent --output /dev/null -w "%{http_code}" -X GET "$token_url" -H "x-api-key: $api_key")
    
    if [[ $http_code -eq 200 ]]; then
        progress_bar
        echo -ne "\r\033[2K"
        token=$(curl --silent -X GET "$token_url" -H "x-api-key: $api_key" | jq -r '.token')
        sleep 1
        echo -e "\n${GREEN}${TOKEN_EMOJI} Token Generated${NC}\n"
    else
        echo -e "\n${RED}${ERROR_EMOJI} Error:${NC} Failed to get token. Please check your x-api-key or try again later.\n"
        exit 1
    fi
}

# Function to validate user input
validate_input() {
    local input="$1"
    local input_length=${#input}

    # Check if input is empty
    if [[ -z "$input" ]]; then
        echo -e "${RED}${ERROR_EMOJI} Error:${NC} Input cannot be empty."
        return 1
    fi

    # Check input length
    if (( input_length < 2 || input_length > 500 )); then
        echo -e "${RED}${ERROR_EMOJI} Error:${NC} Input must be between 2 and 500 characters."
        return 1
    fi

    return 0
}

# Function to make API request with token
make_api_request() {
    api_url="$API_URL/alexa"
    
    # Prompt user for data with validation
    while true; do
        read -p "Enter data (2-500 characters): " data
        validate_input "$data" && break
    done

    # Sending cURL request with token
    json_data="{\"alexamessage\": \"$data\"}"
    response=$(curl -s -X POST "$api_url" -H "authorization: $token" -H "Content-Type: application/json" -d "$json_data")
    
    # Parse JSON response
    alexa_message=$(echo "$response" | jq -r '.alexamessage')

    if [[ $? -eq 0 ]]; then
        echo -e "\n${GREEN}${SUCCESS_EMOJI} Success:${NC} API request successful.\n"
        echo -e "${GREEN}${INFO_EMOJI}  Alexa Message:${NC} $alexa_message\n"
    else
        echo -e "\n${RED}${ERROR_EMOJI} Error:${NC} Failed to make API request. Please try again later.\n"
    fi

}

# Get token
get_token

# Add a sleep time of 2 seconds
sleep 2

# Make API request using token
make_api_request
