-- 1 - importa o csv de empresas
COPY empresa (cnpj, razao_social)
FROM '/caminho/do/arquivo/empresas.csv'
DELIMITER ','
CSV HEADER;

-- importa o csv de socios
COPY socio (cpf, nome)
FROM '/caminho/do/arquivo/socios.csv'
DELIMITER ','
CSV HEADER;

--  importa o csv de participacoes (precisa ser depois dos dois acima)
COPY participacoes (empresa_cnpj, cpf)
FROM '/caminho/do/arquivo/participacoes.csv'
DELIMITER ','
CSV HEADER;
