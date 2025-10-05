class Meteoro:
    def __init__(self, args):
        for chave, valor in args.items():
            nova_chave =  chave.replace("-","_")
            setattr(self, nova_chave, valor)

    def position_data(self):
        pass

    def info(self):
        print(f"Data: {self.date}\n",
              f"Latitude: {self.lat} {self.lat_dir}\n",
              f"Altitude: {self.alt} km\n",
              f"Longitude: {self.lon} {self.lon_dir}\n",
              f"Velocidade: {self.vel} km/s\n",
              f"Energia: {self.energy} x10¹⁰ J")


if __name__ == "__main__":
    from meteoros import Meteoros
    lista = Meteoros.all(limit=1)
    if lista:
        met = Meteoro(lista[0])
        met.info()
        print(met.date)
