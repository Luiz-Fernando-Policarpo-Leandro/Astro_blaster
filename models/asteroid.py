from connection import response_neows
class Asteroid:
    def __init__(self,args):
        for chave, valor in args.items():
            setattr(self,chave, valor)
    
    def position_by_data(self, time):
        pass

    def position(self):
        pass

if __name__ == "__main__":
    data = response_neows("neo/3542519")


    astro = Asteroid(data)

    print(astro.name, astro.links,astro.neo_reference_id)
    print(astro.close_approach_data[0])
