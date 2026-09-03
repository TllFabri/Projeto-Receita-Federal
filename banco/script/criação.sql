-- TABELA EMPRESA
CREATE TABLE empresa (
    cnpj VARCHAR(14) NOT NULL PRIMARY KEY,
    razao_social VARCHAR(255)
);

-- TABELA SOCIO 
CREATE TABLE socio (
    cpf VARCHAR(11) NOT NULL PRIMARY KEY,
    nome VARCHAR(255)
);

-- TABELA PARTICIPACOES
CREATE TABLE participacoes (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL,
    empresa_cnpj VARCHAR(14) NOT NULL,
    percentual_participacao NUMERIC(5,2),
    FOREIGN KEY (cpf) REFERENCES socio(cpf),
    FOREIGN KEY (empresa_cnpj) REFERENCES empresa(cnpj),
    CONSTRAINT uq_socio_empresa UNIQUE (cpf, empresa_cnpj)
);

