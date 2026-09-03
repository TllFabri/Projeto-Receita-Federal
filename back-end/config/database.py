import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def conectar():
    try:
        conexao = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        print("Conexão com o banco realizada com sucesso!")
        return conexao
    except Exception as erro:
        print(f"Erro ao conectar com o banco: {erro}")
        return None