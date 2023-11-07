# Desafio Gen

## Running the project

Create `.env` file based on `sample.env` and fill in `MONGO_URI` env with your own mongo uri connection.
<br> <br>
Install packages with `npm install`
<br> <br>
Run project with `npm run start:prod`
<br> <br>
OR run it with Docker: `npm run image:build` followed by `npm run image:run`
<br> <br>
Run tests with `npm run test`

### Docs

Documentation is available on the `/api` route

### Comentários

Foi utilizado o Nest.js pois ele facilita o uso do Typescript, de validatores de entrada, de gerenciamento de erro, de documentação e ele encoraja um certo grau de estruturação. 
<br> <br>
Os testes que foram escritos são testes de integração. Nomeei os arquivos com "e2e" para diferenciar dos arquivos de teste unitário gerados pelo próprio Nest, ainda que testes e2e reais sejam mais robustos. 
<br> <br>
Preferi esses testes aos unitários pois acredito que para as funcionalidades propostas eles agregam mais valor, cobrindo melhor a funcionalidade geral de cada rota. Até porque com o Nest esses seriam testes para os validadores, os filtros de erro, os controllers, os services e a conexão com o banco. Não necessariamente complicados de serem feitos mas para o que foi proposto talvez ficaria um tanto demais. Por esse mesmo motivo também não separei os acessos ao banco em uma camada de arquivos "repository" nem fiz melhor uso de interfaces para os testes.


