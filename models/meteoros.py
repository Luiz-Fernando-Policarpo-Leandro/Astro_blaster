from connection import response_fireball

class Meteoros:

    @staticmethod
    def all(limit=5, req_loc=True):
        params = f"limit={limit}&req-loc={str(req_loc).lower()}"
        data = response_fireball(params)
        print(data)

        if not data or "data" not in data:
            return []

        fields = data["fields"]
        all_meteoros = []
        for met in data["data"]:
            met_dict = dict(zip(fields, met))
            all_meteoros.append(met_dict)

        return all_meteoros
    
    def find_by(params):
        pass



if __name__ == "__main__":
    x = Meteoros.all(limit=5)
    for m in x: 
        print(m)
