import requests
import json

url = "http://127.0.0.1:8000/api/analyze/"
payload = {"query": "Analyze Wakad"}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n--- SUCCESS! API Response Preview ---")
        print(f"Summary: {data.get('summary')}")
        print(f"Rows Found: {len(data.get('table_data', []))}")
        if data.get('chart_data'):
            print(f"Sample Chart Data: {data['chart_data'][0]}")
        else:
            print("WARNING: 'chart_data' is empty. Check Excel column names (Year, Price, Demand).")
    else:
        print("Error:", response.text)
except Exception as e:
    print(f"Connection Failed. Is the server running? Error: {e}")
