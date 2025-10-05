from connection import response_neows
class Asteroids:

    def all(page = 0):
        data = response_neows("neo/browse",f"page={page}")

        all_asteroids = [{"id": met["id"],"name": met["name"], "link": met["links"]} for met in data["near_earth_objects"]]

        return all_asteroids


if __name__ == "__main__":
    x = Asteroids.all()
    print(x)