from flask import Flask, jsonify
from flask_cors import CORS
from services.consulta import buscar_empresa, buscar_socios, buscar_empresas_do_socio, buscar_cnpj_parcial

app = Flask(__name__)
CORS(app)

@app.route('/empresa/<cnpj>')
def empresa(cnpj):
    resultado = buscar_empresa(cnpj)
    if resultado:
        return jsonify(resultado)
    return jsonify({"erro": "Empresa não encontrada"}), 404

@app.route('/socios/<cnpj>')
def socios(cnpj):
    resultado = buscar_socios(cnpj)
    return jsonify(resultado)

@app.route('/conexoes/<cpf>')
def conexoes(cpf):
    resultado = buscar_empresas_do_socio(cpf)
    return jsonify(resultado)

@app.route('/buscar/<trecho>')
def buscar(trecho):
    trecho_limpo = trecho.replace(".", "").replace("/", "").replace("-", "")
    resultado = buscar_cnpj_parcial(trecho_limpo)
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True)