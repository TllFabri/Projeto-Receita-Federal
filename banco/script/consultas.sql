--Busca empresa pelo CNPJ e lista seus sócios:
SELECT 
    e.cnpj,
    e.razao_social,
    COUNT(p.cpf) OVER (PARTITION BY e.cnpj) AS quantidade_socios,
    s.nome,
    s.cpf
FROM empresa e
LEFT JOIN participacoes p ON p.empresa_cnpj = e.cnpj
LEFT JOIN socio s ON s.cpf = p.cpf
WHERE e.cnpj = '64342828000100'
ORDER BY s.nome;
