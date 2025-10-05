class Meteoro:
    def __init__(self, args):
        for chave, valor in args.items():
            nova_chave =  chave.replace("-","_")
            setattr(self, nova_chave, valor)

    def fragmentation_possibility(self):
        """ Posibilidade de fragmentação de meteoro perto da terra """
        alt = self.alt
        impact_e = self.impact_e
        energy = self.energy

        if alt is not None:
            if alt <= 5.0 and (impact_e and impact_e >= 0.1):
                return True  
            if alt <= 10.0 and (energy and energy >= 10):
                return True
            return False
        else:
            if (impact_e and impact_e >= 1.0) or (energy and energy >= 20):
                return True
            return False

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
    met = Meteoro(lista[0])
    met.info()
    print(met.date)
