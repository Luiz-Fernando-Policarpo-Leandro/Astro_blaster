import requests
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("NASA_KEY_API")


ASTEROIDS_API_URL = "https://api.nasa.gov/neo/rest/v1"


def response_api(endpoint, params = ""):
    response = requests.get(f"{ASTEROIDS_API_URL}/{endpoint}?{params}api_key={API_KEY}")
    if response.status_code != 200:
        return {"error": response.status_code}
    else:
        return response.json()

# Teste
if __name__ == "__main__":

    url = "feed"
    data = response_api(url)
    
    print("Chaves principais da resposta:")
    print(data.keys())
        
