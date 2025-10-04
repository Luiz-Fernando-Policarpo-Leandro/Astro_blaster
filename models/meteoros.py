from connection import response_api

class Meteoros:

    def all():
        data = response_api("neo/browse")

        #all_meteoros = {}

        #for met in data["near_earth_objects"]:
        #    metoro = {"id": met["id"],"name": met["name"], "link": met["links"]}


        all_meteoros = [{ "id": met["id"],"name": met["name"], "link": met["links"]} for met in data["near_earth_objects"]]
        return all_meteoros
    
    def next_page(self, metoro):
        pass



if __name__ == "__main__":
    x = Meteoros.all()
    print(x["page"], x["near_earth_objects"][0]["name"])
