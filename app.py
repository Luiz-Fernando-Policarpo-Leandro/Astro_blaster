from flask import Flask, render_template, request

app = Flask(__name__)

# gets
@app.get("/")
def home():
    return render_template("index.html")

@app.route("/simulacao", methods=["GET","POST"])
def simulacao_get():
    if request.method == "GET":
        return render_template("simulacao.html")
    

@app.get("/sobre")
def sobre():
    return render_template("sobre.html")


if __name__ == "__main__":
    app.run(debug=True)
