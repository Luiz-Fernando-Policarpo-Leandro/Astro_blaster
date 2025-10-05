from flask import Flask, render_template, request
from models import meteoros

app = Flask(__name__)

# gets
@app.get("/")
def home():
    return render_template("index.html")

@app.get("/sobre")
def sobre():
    return render_template("sobre.html")


@app.routes("/meteoro/")
@app.routes("/meteoro/<id_meteoro>")
def meteoro(id_meteoro = None):
    if id_meteoro:
         obj_meteoro = meteoros.find_by(id_meteoro)
    else:
        pass
    
    return render_template()



@app.route("/simulacao", methods=["GET","POST"])
def simulacao_get():
    if request.method == "GET":
        return render_template("simulacao.html")
    




if __name__ == "__main__":
    app.run(debug=True)
