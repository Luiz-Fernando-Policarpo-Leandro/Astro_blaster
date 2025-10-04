from connection import response_api
class Meteoro:
    def __init__(self,args):
        for chave, valor in args.items():
            setattr(self,chave, valor)

if __name__ == "__main__":

    url = "neo/3542519"
    data = response_api(url)

    print(data.keys())

    met = Meteoro(data)

    print(met.name, met.links,met.neo_reference_id)
    print(met.close_approach_data[0]["close_approach_date"])