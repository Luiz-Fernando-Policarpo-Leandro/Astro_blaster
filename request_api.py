import requests
from dotenv import load_dotenv
import os

ASTEROIDS_API_URL = "https://api.nasa.govm/neo/rest/v1/feed" 

response = requests.get(ASTEROIDS_API_URL)


if response.status_code != 200:
    print(f"erro na requisição, status code: {response.status_code}")



if __name__ == "__main__":
    data = response.json()
    print(data.keys())
    ner_earth_objects = data["near_earth_objects"]