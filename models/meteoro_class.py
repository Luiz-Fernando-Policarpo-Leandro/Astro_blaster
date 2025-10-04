from connection import response_api
from astroquery.jplhorizons import Horizons
from datetime import datetime

class Meteoro:
    def __init__(self,args):
        for chave, valor in args.items():
            setattr(self,chave, valor)
    
    def position_by_data(self, time):
        pass

    def position(self):
        for time_data in self.close_approach_data:
            date_str = time_data["close_approach_date"]
            try:
                dt = datetime.strptime(date_str, '%Y-%m-%d')

                # Filtrar datas fora de um intervalo razoável
                if dt.year < 1950 or dt.year > 2100:
                    print(f"⚠️ Data {date_str} fora do intervalo suportado. Ignorando.")
                    continue

                time_asteroid = dt.strftime('%Y-%m-%d')
                obj = Horizons(id=self.designation, location='500@10', epochs=time_asteroid)
                vectors = obj.vectors()

                # Pega posição x, y, z
                pos = vectors['x'][0], vectors['y'][0], vectors['z'][0]
                print(f"Posição em {time_asteroid}: {pos}")

            except Exception as e:
                print(f"Erro ao processar a data {date_str}: {e}")


if __name__ == "__main__":

    url = "neo/3542519"
    data = response_api(url)

    print(data.keys())

    met = Meteoro(data)

    print(met.name, met.links,met.neo_reference_id)
    print(met.close_approach_data[0])
    met.position()