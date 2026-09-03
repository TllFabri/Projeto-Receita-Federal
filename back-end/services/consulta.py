from config.database import conectar

def buscar_empresa(cnpj):
    conexao = conectar()
    if not conexao:
        return None

    cursor = conexao.cursor()
    cursor.execute("SELECT cnpj, razao_social FROM empresa WHERE cnpj = %s", (cnpj,))
    resultado = cursor.fetchone()

    cursor.close()
    conexao.close()

    if resultado:
        return {"cnpj": resultado[0], "razao_social": resultado[1]}
    return None


def buscar_socios(cnpj):
    conexao = conectar()
    if not conexao:
        return []

    cursor = conexao.cursor()
    cursor.execute("""
                   SELECT s.cpf, s.nome
                   FROM socio s
                            JOIN participacoes p ON s.cpf = p.cpf
WHERE p.empresa_cnpj = %s
                   """, (cnpj,))
    resultados = cursor.fetchall()

    cursor.close()
    conexao.close()

    socios = []
    for row in resultados:
        socios.append({"cpf": row[0], "nome": row[1]})

    return socios


def buscar_empresas_do_socio(cpf):
    conexao = conectar()
    if not conexao:
        return []

    cursor = conexao.cursor()
    cursor.execute("""
                   SELECT DISTINCT e.cnpj, e.razao_social
FROM empresa e
JOIN participacoes p ON e.cnpj = p.empresa_cnpj
WHERE p.cpf = %s
                   """, (cpf,))
    resultados = cursor.fetchall()

    cursor.close()
    conexao.close()

    empresas = []
    for row in resultados:
        empresas.append({"cnpj": row[0], "razao_social": row[1]})

    return empresas

def buscar_cnpj_parcial(trecho):
    conexao = conectar()
    if not conexao:
        return []

    cursor = conexao.cursor()
    cursor.execute("""
                   SELECT DISTINCT cnpj, razao_social
                   FROM empresa
                   WHERE cnpj LIKE %s LIMIT 10
                   """, (trecho + "%",))
    resultados = cursor.fetchall()

    cursor.close()
    conexao.close()

    empresas = []
    for row in resultados:
        empresas.append({"cnpj": row[0], "razao_social": row[1]})

    return empresas