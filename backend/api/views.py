import os
import pandas as pd
import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

# --- CONFIGURATION ---
GOOGLE_API_KEY = "AIzaSyDp6DNxqgBc11IyyNwdkwjEK3vFmqa1Tkk"
genai.configure(api_key=GOOGLE_API_KEY)

def get_data():
    file_path = os.path.join(settings.BASE_DIR, 'data.xlsx')
    if not os.path.exists(file_path): return None
    try:
        df = pd.read_excel(file_path)
        df.columns = df.columns.str.strip().str.lower()
        return df
    except Exception: return None

@api_view(['POST'])
def analyze_real_estate(request):
    query = request.data.get('query', '').lower()
    df = get_data()
    
    if df is None: return Response({"error": "Data file missing"}, status=500)

    # 1. Map Columns
    col_map = {
        'location': 'final location', 
        'year': 'year', 
        'price': 'flat - weighted average rate', 
        'demand': 'total sold - igr'
    }
    
    # 2. Filter Data
    unique_locs = df[col_map['location']].dropna().unique()
    found_locs = [loc for loc in unique_locs if str(loc).lower() in query]
    
    # --- LOGIC CHANGE IS HERE ---
    filtered_df = pd.DataFrame()
    loc_name = None
    
    if found_locs:
        # CASE A: Location Found -> Show Data
        filtered_df = df[df[col_map['location']].isin(found_locs)]
        loc_name = ", ".join(found_locs)
    else:
        # CASE B: No Location -> NO DATA (Empty DataFrame)
        filtered_df = pd.DataFrame()
        loc_name = None

    # 3. Prepare Chart & Table (Only if data exists)
    chart_data = []
    table_data = []
    
    if not filtered_df.empty:
        # Chart
        grouped = filtered_df.groupby(col_map['year']).agg({
            col_map['price']: 'mean',
            col_map['demand']: 'sum'
        }).reset_index()
        grouped.rename(columns={col_map['year']: 'year', col_map['price']: 'price', col_map['demand']: 'demand'}, inplace=True)
        chart_data = grouped.to_dict(orient='records')

        # Table
        table_data = filtered_df.fillna('').head(50).to_dict(orient='records')

    # 4. Generate Response using Gemini
    summary = "I couldn't generate a response."
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')

        if not filtered_df.empty:
            # DATA PROMPT: If we have data, ask AI to analyze it
            avg_price = filtered_df[col_map['price']].mean()
            total_demand = filtered_df[col_map['demand']].sum()
            min_year = filtered_df[col_map['year']].min()
            max_year = filtered_df[col_map['year']].max()

            prompt = (
                f"You are a Real Estate Expert. The user asked: '{query}'. "
                f"Data for {loc_name} ({min_year}-{max_year}): "
                f"Avg Price ₹{avg_price:,.0f}, Total Sold {total_demand}. "
                f"Summarize the trends naturally in 2-3 sentences."
            )
        else:
            # NO DATA PROMPT: Just chat casually
            prompt = (
                f"You are a helpful Real Estate Assistant. The user said: '{query}'. "
                f"You do not have specific data for this query because no location (like Wakad or Baner) was mentioned. "
                f"Reply politely. If they asked for analysis, tell them to mention a specific location from the Pune dataset."
            )
        
        response = model.generate_content(prompt)
        summary = response.text

    except Exception as e:
        print(f"Gemini Error: {e}")
        if not filtered_df.empty:
             summary = f"Found data for {loc_name}. Avg Price: {avg_price:,.0f}."
        else:
             summary = "Please mention a location (e.g., 'Analyze Wakad') to see charts and data."

    return Response({
        "summary": summary,
        "chart_data": chart_data,  # Will be empty [] if no location found
        "table_data": table_data   # Will be empty [] if no location found
    })