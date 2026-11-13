import DocumentoLegal from "../components/DocumentoLegal";

function TermoAceite() {
    return (
        <DocumentoLegal
            titulo="Termo de Aceite e Uso"
            subtitulo="Condições para utilizar a plataforma MenteUp."
            outroDocumento={{ rotulo: "Política de Privacidade", para: "/politica-privacidade" }}
        >
            <p>
                <strong>Última atualização:</strong> 13 de novembro de 2026.
            </p>

            <h2>1. Apresentação</h2>

            <p>
                O MenteUp é uma plataforma web educacional que apoia o processo de aprendizagem por meio de
                atividades interativas, desafios ao vivo e elementos de gamificação, como pontos de experiência
                (XP), níveis, conquistas e ranking.
            </p>

            <p>
                O MenteUp foi desenvolvido como Projeto Final de Curso (PFC) na Universidade de Mogi das Cruzes
                (UMC). Ele tem caráter de apoio às atividades educacionais e não substitui o trabalho de
                professores, instituições de ensino ou demais profissionais responsáveis pela aprendizagem.
            </p>

            <p>
                Este Termo deve ser lido em conjunto com a <strong>Política de Privacidade</strong>, que explica
                quais dados pessoais são tratados e como são protegidos.
            </p>

            <h2>2. Aceite dos Termos</h2>

            <p>
                Para criar a conta e usar o MenteUp, o usuário precisa abrir e ler este Termo de Aceite e a
                Política de Privacidade. A opção "Li e aceito" só fica disponível depois que os dois documentos
                são abertos.
            </p>

            <p>
                Ao marcar essa opção, o usuário declara que leu e concorda com as condições destes documentos. A
                data do aceite fica registrada na conta. Sem o aceite, a conta não é criada nem ativada.
            </p>

            <p>
                Os documentos permanecem disponíveis na plataforma para consulta a qualquer momento.
            </p>

            <h2>3. Perfis de Usuário</h2>

            <p>O MenteUp possui três perfis, cada um com permissões próprias:</p>

            <ul>
                <li>
                    <strong>Aluno:</strong> participa das turmas, responde atividades e desafios, acumula XP,
                    conquistas e posições no ranking;
                </li>
                <li>
                    <strong>Professor:</strong> cria e gerencia as atividades e os desafios das turmas em que é
                    o professor responsável e acompanha o desempenho dos alunos dessas turmas;
                </li>
                <li>
                    <strong>Administrador:</strong> gerencia usuários, turmas, atividades e desafios de toda a
                    plataforma, consulta os registros de segurança e os indicadores gerais.
                </li>
            </ul>

            <h2>4. Cadastro e Conta do Usuário</h2>

            <p>A conta pode ser criada de duas formas:</p>

            <ul>
                <li>
                    <strong>Cadastro público:</strong> a própria pessoa cria a conta como aluno ou professor,
                    informando nome, e-mail e senha e aceitando estes documentos;
                </li>
                <li>
                    <strong>Convite do administrador:</strong> o administrador cadastra o nome, o e-mail e o
                    perfil da pessoa, que recebe um convite por e-mail. Pelo link do convite, válido por 72
                    horas, ela aceita estes documentos e cria a própria senha.
                </li>
            </ul>

            <p>Contas de administrador só podem ser criadas por outro administrador.</p>

            <p>
                O usuário é responsável por informar dados verdadeiros, usar um e-mail ao qual tenha acesso e
                manter os dados da conta atualizados.
            </p>

            <h2>5. Senha</h2>

            <p>Toda senha criada ou alterada no MenteUp deve ter:</p>

            <ul>
                <li>No mínimo 8 e no máximo 72 caracteres (letras com acento contam como 2);</li>
                <li>Pelo menos uma letra maiúscula e uma letra minúscula;</li>
                <li>Pelo menos um número;</li>
                <li>Pelo menos um caractere especial (por exemplo: @ # $ % !);</li>
                <li>Nenhum espaço no início ou no fim.</li>
            </ul>

            <p>
                A senha é de uso pessoal e não deve ser compartilhada. Ela nunca é guardada como foi digitada:
                o sistema armazena apenas uma versão criptografada (hash), que não permite recuperar a senha
                original.
            </p>

            <h2>6. Acesso, Verificação em Dois Fatores e Bloqueio</h2>

            <p>O acesso ao MenteUp acontece em duas etapas:</p>

            <ul>
                <li>O usuário informa o e-mail e a senha;</li>
                <li>
                    O sistema envia ao e-mail da conta um código de 6 dígitos, válido por 5 minutos, que deve ser
                    digitado para concluir a entrada (verificação em dois fatores).
                </li>
            </ul>

            <p>Para proteger as contas, o sistema aplica os seguintes limites:</p>

            <ul>
                <li>Após 3 senhas erradas seguidas, a conta é bloqueada;</li>
                <li>Após 5 erros no mesmo código de verificação, o código deixa de valer;</li>
                <li>
                    Um novo código pode ser pedido até 3 vezes por acesso, com intervalo mínimo de 60 segundos
                    entre os pedidos.
                </li>
            </ul>

            <p>
                Para desbloquear a conta ou recuperar o acesso, o usuário deve usar a opção "Esqueci minha
                senha". O sistema envia ao e-mail um link para criar uma nova senha, válido por 30 minutos e que
                só pode ser usado uma vez.
            </p>

            <p>
                Depois de entrar, a sessão vale por até 60 minutos. Ao final desse período, é preciso entrar de
                novo.
            </p>

            <p>
                Os códigos e links enviados por e-mail são de uso exclusivo do titular da conta e não devem ser
                repassados a ninguém.
            </p>

            <h2>7. Turmas</h2>

            <ul>
                <li>
                    Cada turma pode ter um professor responsável. Quem cria a turma como professor fica
                    responsável por ela; o administrador pode escolher ou trocar o professor responsável;
                </li>
                <li>O professor responsável e o administrador podem adicionar e remover alunos da turma;</li>
                <li>
                    O aluno pode pedir para entrar ou sair de uma turma. O pedido é aprovado ou recusado pelo
                    professor responsável ou por um administrador, e o aluno pode cancelá-lo enquanto estiver
                    pendente.
                </li>
            </ul>

            <h2>8. Atividades</h2>

            <p>
                O professor responsável pela turma, ou um administrador, cria as atividades da turma. Os modelos
                disponíveis são:
            </p>

            <ul>
                <li><strong>Quiz:</strong> perguntas de múltipla escolha;</li>
                <li><strong>Verdadeiro ou falso;</strong></li>
                <li><strong>Associação:</strong> ligar itens que se correspondem;</li>
                <li><strong>Ordenação:</strong> colocar itens na ordem correta;</li>
                <li><strong>Lacunas:</strong> completar os espaços de um texto.</li>
            </ul>

            <p>
                Os alunos da turma acessam as atividades publicadas e enviam as respostas pela plataforma. O
                progresso de uma atividade em andamento é salvo. Ao concluir, o sistema corrige as respostas e
                calcula o resultado e a pontuação, e o professor pode registrar um comentário sobre o resultado.
            </p>

            <p>
                As perguntas de uma atividade só podem ser substituídas enquanto nenhum aluno tiver começado a
                respondê-la.
            </p>

            <h2>9. Desafios ao Vivo</h2>

            <p>
                O professor responsável, ou um administrador, pode conduzir desafios ao vivo com a turma: as
                perguntas aparecem uma de cada vez, com tempo limitado, e os alunos respondem ao mesmo tempo.
            </p>

            <p>
                Cada acerto vale de 25 a 75 pontos: 25 pontos fixos e até 50 pontos a mais pela rapidez da
                resposta. Ao final, o desafio apresenta um ranking com o nome e a pontuação dos participantes,
                visível para a turma.
            </p>

            <h2>10. Gamificação</h2>

            <p>Para tornar a aprendizagem mais motivadora, o MenteUp utiliza:</p>

            <ul>
                <li>
                    <strong>XP e níveis:</strong> pontos de experiência ganhos com atividades, desafios e
                    conquistas, que fazem o aluno subir de nível;
                </li>
                <li>
                    <strong>Conquistas:</strong> medalhas desbloqueadas ao atingir metas, como concluir
                    atividades, acertar todas as questões, entrar vários dias seguidos ou subir no ranking;
                </li>
                <li>
                    <strong>Sequência de dias (Intensivão):</strong> contagem dos dias seguidos em que o aluno
                    acessa a plataforma;
                </li>
                <li>
                    <strong>Ranking:</strong> classificação geral dos alunos por XP, que mostra o nome, o
                    avatar, a pontuação e o número de atividades concluídas;
                </li>
                <li>
                    <strong>Avatar:</strong> o usuário pode escolher um entre os animais disponíveis para
                    representá-lo no perfil e no ranking.
                </li>
            </ul>

            <p>
                Os pontos, níveis e conquistas não têm valor financeiro, não podem ser trocados por dinheiro e
                servem apenas para acompanhar a evolução dentro da plataforma.
            </p>

            <h2>11. Notificações e E-mails</h2>

            <p>
                Com a permissão do usuário no navegador ou no dispositivo, o MenteUp pode enviar notificações,
                por meio do Firebase Cloud Messaging (FCM), sobre acontecimentos na plataforma, como novas
                atividades publicadas na turma. As notificações podem ser desativadas a qualquer momento nas
                configurações do navegador ou do dispositivo.
            </p>

            <p>
                Além disso, o sistema envia os e-mails necessários ao funcionamento da conta: códigos de
                verificação, links de redefinição de senha e convites de primeiro acesso.
            </p>

            <h2>12. Meu Perfil e Exclusão da Conta</h2>

            <p>Na área "Meu perfil", o usuário pode:</p>

            <ul>
                <li>Consultar os dados da própria conta;</li>
                <li>Trocar a senha, informando a senha atual;</li>
                <li>Escolher o avatar;</li>
                <li>Excluir a própria conta, confirmando com a senha.</li>
            </ul>

            <p>
                Ao excluir a conta, o nome e o e-mail são apagados de forma definitiva, o usuário sai de todas
                as turmas e não consegue mais entrar. Os resultados das atividades continuam nas estatísticas,
                mas sem identificar a pessoa. Essa ação não pode ser desfeita.
            </p>

            <h2>13. Responsabilidades do Aluno</h2>

            <ul>
                <li>Usar somente a própria conta;</li>
                <li>Proteger a senha e não compartilhar os códigos de verificação;</li>
                <li>Responder às atividades e aos desafios de forma honesta, de acordo com as regras de cada um;</li>
                <li>Tratar colegas e professores com respeito;</li>
                <li>Não tentar acessar informações de outros usuários.</li>
            </ul>

            <h2>14. Responsabilidades do Professor</h2>

            <ul>
                <li>Cadastrar conteúdos corretos e adequados à finalidade educacional;</li>
                <li>
                    Usar as informações dos alunos, como e-mail, respostas e desempenho, apenas para fins
                    pedagógicos;
                </li>
                <li>Não divulgar fora da plataforma dados pessoais ou resultados individuais dos alunos;</li>
                <li>Registrar comentários respeitosos sobre os resultados dos alunos.</li>
            </ul>

            <h2>15. Responsabilidades do Administrador</h2>

            <ul>
                <li>Criar contas e definir perfis apenas para pessoas autorizadas;</li>
                <li>Vincular cada turma ao professor correto;</li>
                <li>
                    Consultar os registros de segurança e os indicadores apenas para administração, segurança e
                    melhoria da plataforma.
                </li>
            </ul>

            <h2>16. Uso Adequado da Plataforma</h2>

            <p>Não é permitido:</p>

            <ul>
                <li>Acessar contas de terceiros ou tentar descobrir senhas e códigos de verificação;</li>
                <li>Tentar burlar os limites de tentativas ou as regras de segurança;</li>
                <li>Tentar obter dados de outros usuários ou acessar áreas sem permissão;</li>
                <li>Comprometer ou sobrecarregar o funcionamento do sistema;</li>
                <li>Inserir conteúdos ofensivos, discriminatórios ou incompatíveis com a finalidade educacional;</li>
                <li>Manipular respostas, pontuações ou rankings de forma indevida.</li>
            </ul>

            <p>
                As ações realizadas na plataforma ficam registradas para fins de segurança. Em caso de uso
                inadequado, o acesso à conta pode ser restringido pela administração.
            </p>

            <h2>17. Disponibilidade</h2>

            <p>
                O MenteUp busca manter a plataforma disponível e funcionando corretamente, mas pode passar por
                interrupções para manutenção, atualizações ou por motivos técnicos fora do seu controle.
            </p>

            <h2>18. Alterações dos Termos</h2>

            <p>
                Este Termo pode ser atualizado para refletir mudanças nas funcionalidades ou nas regras de uso
                do MenteUp. A data da última atualização fica indicada no início do documento.
            </p>

            <h2>19. Contato</h2>

            <p>
                Dúvidas sobre este Termo podem ser enviadas para <strong>empresa.menteup@gmail.com</strong>.
            </p>

            <h2>20. Aceite</h2>

            <p>
                Ao marcar a opção "Li e aceito o Termo de Aceite e a Política de Privacidade", o usuário confirma
                que teve acesso a este documento e concorda com as condições estabelecidas para utilização do
                MenteUp.
            </p>
        </DocumentoLegal>
    );
}

export default TermoAceite;
