import requests
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("NASA_KEY_API")


ASTEROIDS_API_URL = "https://api.nasa.gov/neo/rest/v1"


def response_api(endpoint):
    response = requests.get(f"{ASTEROIDS_API_URL}/{endpoint}?api_key={API_KEY}")
    # print(f"{ASTEROIDS_API_URL}/{endpoint}?api_key={API_KEY}")
    if response.status_code != 200:
        return {"error": response.status_code}
    else:
        return response.json()

# Teste
if __name__ == "__main__":

    url = "feed"
    response = response_api(url)

    data = response.json()

    if response.status_code != 200:
        print(f"Erro na requisição: {response.status_code}")
        print(f"Detalhes: {data}")
    else:
        print("Chaves principais da resposta:")
        print(data.keys())
