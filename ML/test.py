# test_api.py
import requests
import json

DEEPSEEK_API_KEY = "sk-1b264731504f4d4ba53ad0550a6876f1"  # Your actual key
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": "deepseek-chat",
    "messages": [
        {"role": "user", "content": "আসসালামু আলাইকুম, আপনি কেমন আছেন?"}
    ],
    "stream": False,
    "temperature": 0.7,
    "max_tokens": 500
}

response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=30)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Response: {data['choices'][0]['message']['content']}")
else:
    print(f"Error: {response.text}")