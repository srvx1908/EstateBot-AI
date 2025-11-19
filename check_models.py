import google.generativeai as genai

# PASTE YOUR KEY HERE
GOOGLE_API_KEY = "AIzaSyDp6DNxqgBc11IyyNwdkwjEK3vFmqa1Tkk"

genai.configure(api_key=GOOGLE_API_KEY)

print("------------------------------------------------")
print("🔍 Checking available models for your API Key...")
print("------------------------------------------------")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ Found: {m.name}")
except Exception as e:
    print(f"❌ Error: {e}")
    
print("------------------------------------------------")