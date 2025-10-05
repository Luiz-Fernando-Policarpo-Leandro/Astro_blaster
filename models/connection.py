import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

FIREBALL_API_URL = "https://ssd-api.jpl.nasa.gov/fireball.api"


session = requests.Session()
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("https://", adapter)
session.mount("http://", adapter)


def response_fireball(params=""):
    """Faz requisição para a Fireball Data API da NASA (meteoros) com timeout e retry."""
    try:
        response = session.get(f"{FIREBALL_API_URL}?{params}", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        print("Erro: tempo de conexão esgotou (timeout).")
    except requests.exceptions.ConnectionError:
        print("Erro: falha na conexão com a API.")
    except requests.exceptions.HTTPError as e:
        print(f"Erro HTTP: {e.response.status_code}")
    except Exception as e:
        print(f"Erro inesperado: {e}")
    return None
