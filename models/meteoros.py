from connection import response_api

class Meteoros:

    def all(page = 0):
        data = response_api("neo/browse",f"page={page}")
        
        all_meteoros = [{"id": met["id"],"name": met["name"], "link": met["links"]} for met in data["near_earth_objects"]]
        
        return all_meteoros



if __name__ == "__main__":
    x = Meteoros.all()
    print(x)
