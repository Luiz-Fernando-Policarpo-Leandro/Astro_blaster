import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("NASA_KEY_API")

FIREBALL_API_URL = "https://ssd-api.jpl.nasa.gov/fireball.api"
ASTEROIDS_API_URL = "https://api.nasa.gov/neo/rest/v1"
JPL_NASA_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"


session = requests.Session()
retry_strategy = Retry(
    total=3,
    backoff_factor=2,
    status_forcelist=[413, 429, 500, 502, 503, 504],
    allowed_methods=["GET"]
)

adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("https://", adapter)
session.mount("http://", adapter)


def response_api(link):
    """ Faz requisição para as APIs da NASA (meteoros) com timeout e retry. """
    try:
        response = session.get(link, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        print("Erro: tempo de conexão esgotou (timeout).")
    except requests.exceptions.ConnectionError as e:
        print(f"Erro: falha na conexão com a API.")
    except requests.exceptions.HTTPError as e:
        print(f"Erro HTTP: {e.response.status_code}")
    except Exception as e:
        print(f"Erro inesperado: {e}")
    return None


def response_fireball(params=""):
    """Faz requisição para a Fireball Data API da NASA (meteoros) com timeout e retry."""
    response = response_api(f"{FIREBALL_API_URL}?{params}")
    return response

def response_neows(endpoint,params=""):
    """ Requsição para Asteroids Neo WS (asteroids) com timeout e retry """
    params = f"{params}&" if params else ""
    endpoint_str = f"{endpoint}{params}" if endpoint[-1] == "/" else f"{endpoint}?{params}"
    response = response_api(f"{ASTEROIDS_API_URL}/{endpoint_str}api_key={API_KEY}")

    return response

def response_jpl_api(params):
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    params = {
        "format": "json",
        "COMMAND": "199", 
        "EPHEM_TYPE": "ELEMENTS",
        "START_TIME": "2025-01-01",
        "STOP_TIME": "2025-01-02",
        "STEP_SIZE": "1d",
    }