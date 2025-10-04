import requests
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("NASA_KEY_API")


ASTEROIDS_API_URL = "https://api.nasa.gov/neo/rest/v1"


def response_api(endpoint, params = ""):

    params = f"{params}&" if params else ""

    response = requests.get(f"{ASTEROIDS_API_URL}/{endpoint}?{params}api_key={API_KEY}")

    if response.status_code != 200:
        return {"error": response.status_code}
    else:
        return response.json()
def response_jpl_api(params):
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    params = {
        "format": "json",
        "COMMAND": "199", 
        "EPHEM_TYPE": "ELEMENTS",
        "START_TIME": "2025-01-01",
        "STOP_TIME": "2025-01-02",
        "STEP_SIZE": "1 d",
    }

# Teste
if __name__ == "__main__":

    url = "feed"
    data = response_api(url)
    
    print("Chaves principais da resposta:")
    print(data.keys())
        
