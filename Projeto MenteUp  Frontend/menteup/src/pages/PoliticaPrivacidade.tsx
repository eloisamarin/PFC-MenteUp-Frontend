import DocumentoLegal from "../components/DocumentoLegal";

function PoliticaPrivacidade() {
    return (
        <DocumentoLegal
            titulo="Política de Privacidade"
            subtitulo="Como o MenteUp utiliza e protege os seus dados."
            outroDocumento={{ rotulo: "Termo de Aceite", para: "/termo-de-aceite" }}
        >
            <p>
                <strong>Última atualização:</strong> 13 de novembro de 2026.
            </p>

            <h2>1. Apresentação</h2>

            <p>
                Esta Política de Privacidade explica quais dados pessoais o MenteUp utiliza, para que servem,
                quem tem acesso a eles, por quanto tempo são mantidos e como são protegidos. Ela segue a Lei
                Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018).
            </p>

            <p>
                O MenteUp foi desenvolvido como Projeto Final de Curso (PFC) na Universidade de Mogi das Cruzes
                (UMC). O princípio adotado é a <strong>minimização</strong>: a plataforma usa apenas os dados
                necessários para funcionar e mostra a cada pessoa somente o que ela precisa ver.
            </p>

            <h2>2. Dados que o MenteUp Utiliza</h2>

            <h3>2.1 Dados da conta</h3>

            <ul>
                <li>Nome;</li>
                <li>Endereço de e-mail, que também identifica a conta no login;</li>
                <li>Perfil: aluno, professor ou administrador;</li>
                <li>Senha, guardada somente de forma criptografada (hash);</li>
                <li>Avatar escolhido;</li>
                <li>Data e hora do aceite do Termo de Aceite e desta Política;</li>
                <li>Situação da conta, como convite pendente e bloqueio por tentativas de acesso.</li>
            </ul>

            <h3>2.2 Dados de acesso e segurança</h3>

            <ul>
                <li>Códigos de verificação em dois fatores enviados por e-mail e o número de tentativas;</li>
                <li>Links de redefinição de senha e de primeiro acesso, guardados de forma criptografada;</li>
                <li>Número de senhas erradas seguidas e data de bloqueio da conta;</li>
                <li>
                    Registros de ações (logs): o que foi feito, quando, por qual usuário, o resultado (sucesso
                    ou falha) e o endereço IP de origem. Exemplos: entrada no sistema, tentativas de acesso que
                    falharam, criação, edição e exclusão de turmas, atividades, desafios e usuários.
                </li>
            </ul>

            <p>
                <strong>As senhas nunca aparecem nos registros</strong> nem em nenhuma resposta da plataforma.
            </p>

            <h3>2.3 Dados educacionais</h3>

            <ul>
                <li>Turmas das quais o usuário participa e pedidos de entrada ou saída de turmas;</li>
                <li>Respostas às atividades, progresso salvo e resultados;</li>
                <li>Comentários do professor sobre os resultados;</li>
                <li>Respostas, tempo de resposta e pontos nos desafios ao vivo;</li>
                <li>XP, nível, conquistas, posição no ranking e sequência de dias de acesso (Intensivão).</li>
            </ul>

            <h3>2.4 Dados para notificações</h3>

            <p>
                Quando o usuário autoriza notificações no navegador, é gerado um identificador do dispositivo
                (token do Firebase Cloud Messaging), que fica associado à conta para que as notificações
                cheguem ao aparelho certo.
            </p>

            <h2>3. Para que os Dados São Usados</h2>

            <ul>
                <li>Criar e gerenciar as contas, inclusive os convites feitos pelo administrador;</li>
                <li>Confirmar a identidade no login, com senha e código de verificação por e-mail;</li>
                <li>Proteger as contas: bloqueio após tentativas erradas, recuperação de senha e registros de segurança;</li>
                <li>Controlar o que cada perfil pode ver e fazer;</li>
                <li>Organizar turmas, atividades e desafios;</li>
                <li>Corrigir respostas, calcular pontuações e mostrar o desempenho;</li>
                <li>Funcionar a gamificação: XP, níveis, conquistas, ranking e sequência de dias;</li>
                <li>Enviar notificações e e-mails sobre a conta e a plataforma;</li>
                <li>Gerar indicadores gerais de uso, sem identificar pessoas, para a administração;</li>
                <li>Manter, corrigir e melhorar o funcionamento da plataforma.</li>
            </ul>

            <p>
                Os dados <strong>não</strong> são usados para publicidade e <strong>não</strong> são vendidos
                ou repassados para fins comerciais.
            </p>

            <h2>4. Bases Legais</h2>

            <p>O tratamento dos dados se apoia nas seguintes hipóteses da LGPD:</p>

            <ul>
                <li>
                    <strong>Execução do serviço contratado (art. 7º, V):</strong> dados da conta, de acesso e
                    educacionais, sem os quais a plataforma não funciona;
                </li>
                <li>
                    <strong>Legítimo interesse (art. 7º, IX):</strong> registros de segurança e controle de
                    tentativas de acesso, para proteger os usuários e a plataforma;
                </li>
                <li>
                    <strong>Consentimento (art. 7º, I):</strong> notificações no navegador, que dependem da
                    autorização do usuário e podem ser desligadas a qualquer momento.
                </li>
            </ul>

            <h2>5. Quem Pode Ver os Dados</h2>

            <p>
                Cada perfil vê apenas o necessário para a sua função. A própria plataforma impede o acesso a
                informações fora dessas regras.
            </p>

            <ul>
                <li>
                    <strong>O próprio usuário:</strong> vê todos os dados da sua conta na área "Meu perfil";
                </li>
                <li>
                    <strong>Outros alunos:</strong> veem apenas o nome, o avatar e as informações do ranking
                    (pontuação e atividades concluídas) e, nos desafios ao vivo, o nome e a pontuação de quem
                    participou. Não veem o e-mail de ninguém;
                </li>
                <li>
                    <strong>Professores:</strong> veem o nome e o e-mail dos alunos, para identificá-los ao
                    montar as turmas, e o desempenho dos alunos das turmas em que são os responsáveis;
                </li>
                <li>
                    <strong>Administradores:</strong> veem os dados das contas, os registros de segurança e os
                    indicadores gerais, para administrar a plataforma.
                </li>
            </ul>

            <p>
                O token de notificação, a senha criptografada e os dados internos de segurança nunca são
                mostrados a outros usuários.
            </p>

            <h2>6. Serviços de Terceiros</h2>

            <p>
                Para funcionar, o MenteUp usa alguns serviços externos, que recebem apenas os dados
                necessários para a sua tarefa:
            </p>

            <ul>
                <li>
                    <strong>Firebase Cloud Messaging (Google):</strong> entrega das notificações. Recebe o token
                    do dispositivo e o conteúdo da notificação, como o título de uma nova atividade;
                </li>
                <li>
                    <strong>Serviço de e-mail:</strong> envio dos códigos de verificação, links de redefinição de
                    senha e convites. Recebe o endereço de e-mail e o conteúdo da mensagem;
                </li>
                <li>
                    <strong>Grafana:</strong> painel de indicadores usado pela administração. Recebe apenas
                    números gerais (como total de alunos ou atividades por dia), sem nomes nem e-mails.
                </li>
            </ul>

            <p>
                Alguns desses serviços podem armazenar dados em servidores fora do Brasil, de acordo com as
                políticas dos próprios fornecedores.
            </p>

            <h2>7. Dados Guardados no Navegador</h2>

            <p>
                Para manter o usuário conectado, o navegador guarda o token de acesso (válido por até 60
                minutos) e dados básicos da conta, como nome, perfil e avatar. Durante o login, o e-mail fica
                guardado temporariamente até a confirmação do código.
            </p>

            <p>
                O MenteUp <strong>não</strong> usa cookies de publicidade nem ferramentas de rastreamento. Ao
                clicar em "Sair", os dados de acesso são removidos do navegador.
            </p>

            <h2>8. Por Quanto Tempo os Dados São Mantidos</h2>

            <ul>
                <li>Dados da conta e educacionais: enquanto a conta existir;</li>
                <li>Códigos de verificação: válidos por 5 minutos;</li>
                <li>Links de redefinição de senha: válidos por 30 minutos e de uso único;</li>
                <li>Convites de primeiro acesso: válidos por 72 horas e de uso único;</li>
                <li>
                    Registros de segurança: mantidos pelo tempo necessário para a segurança e a auditoria da
                    plataforma.
                </li>
            </ul>

            <h2>9. Exclusão da Conta</h2>

            <p>
                O usuário pode excluir a própria conta a qualquer momento, na área "Meu perfil", confirmando com
                a senha. Na exclusão:
            </p>

            <ul>
                <li>O nome e o e-mail são apagados e substituídos por informações que não identificam a pessoa;</li>
                <li>O usuário sai de todas as turmas;</li>
                <li>O token de notificação e os códigos de verificação são apagados;</li>
                <li>A senha é trocada por uma aleatória, e a conta não pode mais ser acessada;</li>
                <li>
                    Os resultados de atividades e desafios continuam nas estatísticas das turmas, mas sem
                    identificar a pessoa (anonimização).
                </li>
            </ul>

            <p>Essa ação é imediata e não pode ser desfeita.</p>

            <h2>10. Segurança das Informações</h2>

            <p>O MenteUp adota as seguintes medidas para proteger os dados:</p>

            <ul>
                <li>Senhas criptografadas com BCrypt e regras de senha forte;</li>
                <li>Verificação em dois fatores por código enviado ao e-mail;</li>
                <li>Bloqueio da conta após 3 senhas erradas e limite de tentativas no código de verificação;</li>
                <li>Links de redefinição de senha com validade curta e uso único;</li>
                <li>Sessões com token assinado (JWT) e validade de 60 minutos;</li>
                <li>Permissões por perfil em todas as rotas da plataforma;</li>
                <li>Respostas da plataforma com o mínimo de dados pessoais;</li>
                <li>Registro das ações e das tentativas de acesso que falharam, sem armazenar senhas;</li>
                <li>Conexão protegida (HTTPS) no ambiente publicado.</li>
            </ul>

            <p>
                Mesmo com essas medidas, nenhum sistema conectado à internet é totalmente imune a incidentes.
                Se ocorrer um incidente que possa trazer risco aos usuários, os afetados serão comunicados.
            </p>

            <h2>11. Crianças e Adolescentes</h2>

            <p>
                Como plataforma educacional, o MenteUp pode ser usado por alunos menores de idade. Nesse caso, o
                uso deve acontecer no contexto da instituição de ensino e com o conhecimento e a autorização dos
                pais ou responsáveis legais, conforme o artigo 14 da LGPD. Os dados desses alunos são tratados
                no melhor interesse deles e apenas para fins educacionais.
            </p>

            <h2>12. Direitos do Titular</h2>

            <p>Conforme a LGPD, o usuário pode:</p>

            <ul>
                <li>Confirmar se o MenteUp trata seus dados e ter acesso a eles;</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                <li>Pedir a anonimização ou a eliminação de dados desnecessários;</li>
                <li>Excluir a própria conta (veja o item 9);</li>
                <li>Saber com quem os dados são compartilhados (veja o item 6);</li>
                <li>Retirar o consentimento das notificações, desativando-as no navegador;</li>
                <li>Pedir informações sobre o tratamento dos seus dados.</li>
            </ul>

            <p>
                Parte desses direitos pode ser exercida diretamente na área "Meu perfil". Os demais podem ser
                solicitados pelo e-mail de contato.
            </p>

            <h2>13. Responsabilidades do Usuário</h2>

            <ul>
                <li>Criar uma senha forte e não compartilhá-la;</li>
                <li>Não compartilhar códigos de verificação nem links recebidos por e-mail;</li>
                <li>Usar um e-mail ao qual tenha acesso;</li>
                <li>Sair da conta ao usar dispositivos compartilhados;</li>
                <li>Avisar a administração se perceber um acesso não autorizado.</li>
            </ul>

            <h2>14. Atualizações desta Política</h2>

            <p>
                Esta Política pode ser atualizada quando houver mudanças nas funcionalidades, nos dados
                utilizados ou na legislação. A data da última atualização fica indicada no início do documento,
                e a versão atual está sempre disponível na plataforma.
            </p>

            <h2>15. Contato</h2>

            <p>
                Para dúvidas, pedidos sobre os seus dados ou para exercer os seus direitos, entre em contato:
            </p>

            <p>
                <strong>MenteUp</strong>
                <br />
                <strong>E-mail:</strong> empresa.menteup@gmail.com
            </p>
        </DocumentoLegal>
    );
}

export default PoliticaPrivacidade;
