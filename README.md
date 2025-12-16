# Sistema de Gestão de Cupons de Desconto

Sistema web para gestão de cupons entre comerciantes e associados de uma associação.

## Tecnologias

- **Backend**: FastAPI (Python) + MongoDB
- **Frontend**: React + Tailwind CSS
- **Banco de Dados**: MongoDB

## Funcionalidades

### Para Comerciantes (CNPJ)
- Cadastro e login com CNPJ
- Criar cupons de desconto com código hash único
- Consultar cupons (ativos, utilizados, vencidos)
- Registrar uso de cupons apresentados por associados

### Para Associados (CPF)
- Cadastro e login com CPF
- Buscar cupons disponíveis por categoria
- Reservar cupons
- Consultar cupons reservados (ativos, utilizados, vencidos)

## Estrutura do Banco de Dados

### Collections
- **associados**: Dados dos associados (CPF, nome, endereço, contato)
- **comercios**: Dados dos comércios (CNPJ, categoria, razão social)
- **categorias**: Categorias de comércio
- **cupons**: Cupons de desconto criados pelos comércios
- **cupons_associados**: Reservas e uso de cupons


## Validações Implementadas

- Validação de CPF
- Validação de CNPJ
- Validação de datas (início e término de cupons)
- Validação de email
- Hash de senhas com bcrypt
- Código único de 12 posições para cupons

## Categorias Disponíveis

1. Alimentação
2. Vestuário
3. Eletrônicos
4. Saúde e Beleza
5. Serviços
6. Outros

## Fluxo de Uso

1. Comerciante se cadastra e cria cupons
2. Associado busca cupons disponíveis
3. Associado reserva o cupom desejado
4. Associado apresenta código do cupom no estabelecimento
5. Comerciante registra o uso do cupom
