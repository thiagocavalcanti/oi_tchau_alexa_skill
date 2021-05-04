# Oi tchau alexa skill
### Descrição
Essa skill foi feita de forma **não-oficial** com o objetivo de :
 1. Bater o ponto
 2. Recuperar histórico de pontos do último dia
### Como utilizar
 1. Acesse [Alexa Console](https://developer.amazon.com/alexa/console/ask) e se logue com a mesma conta que você utiliza na Alexa
 2. Clique em "Create Skill"
 3. Escolha um nome para skill (sugestão: "oi tchau") e clique em "Create Skill"
 4. Clique em "import skill" e coloque "https://github.com/thiagocavalcanti/oi_tchau_alexa_skill.git"
 5. Após importar a skill, em Build > Invocation, defina como deve ser o nome da skill que você quer invocar ("abrir oi tchau", oi tchau seria a invocação). Observação: Caso você altere esse campo, é necessário clicar em "Build Model"
 6.  Vá para "Code" e dentro da pasta "Lambda", crie um arquivo .env e adicione EMAIL=<SEU_EMAIL> e em outra linha PASSWORD=<SUA_SENHA>
 7. Clique em "Deploy"
 8. Na aba "Test", habilite os testes. Você pode testar no console de teste que abriu ou diretamente na sua Alexa (caso ela seja conectada com a sua conta)
