function PoliticaPrivacidade() {
    return (
        <div className="mu-page">
            <div className="mu-login-page">
                <div
                    className="mu-login-card"
                    style={{
                        maxWidth: "900px",
                        width: "100%",
                    }}
                >
                    <div className="mu-login-brand">
                        <div className="mu-brand">
                            <div className="mu-brand-mark small">
                                M
                            </div>

                            <div className="mu-brand-name small">
                                Mente<span>Up</span>
                            </div>
                        </div>
                    </div>

                    <div className="mu-login-title">
                        <h1>Política de Privacidade</h1>
                        
                    </div>

                    <div
                        style={{
                            textAlign: "left",
                            lineHeight: "1.7",
                            color: "#374151",
                        }}
                    >
                        <h2>1. Apresentação</h2>

                        <p>
                            Esta Política de Privacidade apresenta informações
                            sobre os dados utilizados pelo MenteUp durante a
                            utilização da plataforma, as finalidades desse
                            tratamento e os recursos utilizados para o
                            funcionamento do sistema.
                        </p>

                        <p>
                            O objetivo desta política é proporcionar
                            transparência aos usuários sobre quais informações
                            são utilizadas e como elas participam do
                            funcionamento da plataforma.
                        </p>

                        <h2>2. Dados Utilizados pelo MenteUp</h2>

                        <p>
                            Durante a utilização da plataforma, poderão ser
                            utilizados os seguintes dados:
                        </p>

                        <h3>2.1 Dados de Cadastro</h3>

                        <ul>
                            <li>Nome do usuário;</li>
                            <li>Endereço de e-mail;</li>
                            <li>Senha;</li>
                            <li>Tipo de usuário.</li>
                        </ul>

                        <h3>2.2 Dados relacionados à autenticação</h3>

                        <p>
                            O sistema utiliza informações necessárias para
                            realizar a autenticação e controlar o acesso às
                            funcionalidades protegidas.
                        </p>

                        <p>
                            Durante a verificação em dois fatores, um código
                            de confirmação é enviado para o endereço de
                            e-mail informado pelo usuário.
                        </p>

                        <h3>2.3 Token de notificações</h3>

                        <p>
                            Quando o usuário autoriza o recebimento de
                            notificações, o MenteUp poderá armazenar um
                            <strong> FCM Token </strong>
                            associado à sua conta.
                        </p>

                        <p>
                            Esse token é utilizado para permitir o envio de
                            notificações por meio do Firebase Cloud Messaging.
                        </p>

                        <h2>3. Dados relacionados às atividades</h2>

                        <p>
                            Durante a utilização das funcionalidades
                            educacionais, o sistema poderá armazenar
                            informações relacionadas às atividades.
                        </p>

                        <ul>
                            <li>Atividades disponibilizadas;</li>
                            <li>Turma associada;</li>
                            <li>Respostas enviadas;</li>
                            <li>Pontuações obtidas;</li>
                            <li>Conquistas;</li>
                            <li>Níveis;</li>
                            <li>Informações relacionadas ao progresso;</li>
                            <li>Informações utilizadas pelo ranking.</li>
                        </ul>

                        <h2>4. Finalidades do Tratamento</h2>

                        <p>
                            Os dados utilizados pelo MenteUp possuem diferentes
                            finalidades dentro da plataforma.
                        </p>

                        <ul>
                            <li>Criação e gerenciamento das contas;</li>
                            <li>Autenticação dos usuários;</li>
                            <li>Realização da verificação em dois fatores;</li>
                            <li>Controle de acesso às funcionalidades;</li>
                            <li>Identificação do perfil do usuário;</li>
                            <li>Gerenciamento de turmas;</li>
                            <li>Criação e disponibilização de atividades;</li>
                            <li>Realização e correção de atividades;</li>
                            <li>Registro de respostas;</li>
                            <li>Cálculo de pontuação;</li>
                            <li>Funcionamento de conquistas e rankings;</li>
                            <li>Envio de notificações;</li>
                            <li>Manutenção e funcionamento da plataforma;</li>
                            <li>Segurança da aplicação.</li>
                        </ul>

                        <h2>5. Uso do E-mail</h2>

                        <p>
                            O endereço de e-mail informado pelo usuário possui
                            função importante no funcionamento da plataforma.
                        </p>

                        <p>Ele pode ser utilizado para:</p>

                        <ul>
                            <li>Identificação da conta;</li>
                            <li>Autenticação;</li>
                            <li>Envio do código de verificação 2FA;</li>
                            <li>Comunicações relacionadas à conta, quando aplicável.</li>
                        </ul>

                        <h2>6. Firebase e Notificações</h2>

                        <p>
                            O MenteUp utiliza o Firebase Cloud Messaging (FCM)
                            como serviço externo para o envio de notificações.
                        </p>

                        <p>
                            Quando o usuário autoriza as notificações, o
                            navegador gera um identificador denominado FCM
                            Token, que é associado à conta do usuário no
                            MenteUp.
                        </p>

                        <p>
                            Esse identificador permite que o sistema
                            encaminhe notificações ao navegador autorizado.
                        </p>

                        <p>
                            Por exemplo, quando um professor cria uma nova
                            atividade para uma turma, o MenteUp pode
                            identificar os estudantes associados à turma que
                            possuem um token de notificação registrado e
                            encaminhar uma notificação informando a existência
                            da nova atividade.
                        </p>

                        <h2>7. Serviços Externos</h2>

                        <p>
                            Para disponibilizar determinadas funcionalidades,
                            o MenteUp utiliza serviços externos de tecnologia,
                            incluindo o Firebase para funcionalidades
                            relacionadas ao envio de notificações.
                        </p>

                        <h2>8. Segurança das Informações</h2>

                        <p>
                            O MenteUp utiliza mecanismos de segurança para
                            controlar o acesso às funcionalidades da aplicação.
                        </p>

                        <ul>
                            <li>Autenticação de usuários;</li>
                            <li>Autorização de acesso conforme o perfil;</li>
                            <li>Spring Security;</li>
                            <li>Autenticação baseada em JWT;</li>
                            <li>Verificação em dois fatores;</li>
                            <li>Proteção das rotas da API;</li>
                            <li>Controle de acesso às funcionalidades.</li>
                        </ul>

                        <p>
                            Apesar da adoção de mecanismos de segurança, nenhum
                            sistema conectado à internet pode garantir
                            segurança absoluta contra todos os tipos de
                            incidentes.
                        </p>

                        <h2>9. Acesso às Informações</h2>

                        <p>
                            O acesso às funcionalidades e informações da
                            plataforma depende do perfil do usuário.
                        </p>

                        <p>
                            Estudantes, professores e administradores possuem
                            permissões diferentes dentro do sistema.
                        </p>

                        <h2>10. Direitos dos Titulares</h2>

                        <p>
                            Os usuários possuem direitos relacionados aos seus
                            dados pessoais, conforme a legislação aplicável.
                        </p>

                        <p>Entre esses direitos podem estar:</p>

                        <ul>
                            <li>Confirmação da existência de tratamento;</li>
                            <li>Acesso aos dados;</li>
                            <li>Correção de informações incorretas ou incompletas;</li>
                            <li>Informações sobre o tratamento realizado;</li>
                            <li>Solicitação de providências relacionadas aos dados, quando aplicável.</li>
                        </ul>

                        <h2>11. Responsabilidade do Usuário</h2>

                        <p>
                            O usuário também possui responsabilidade pela
                            proteção das informações utilizadas para acessar
                            sua conta.
                        </p>

                        <ul>
                            <li>Utilizar uma senha segura;</li>
                            <li>Não compartilhar a senha;</li>
                            <li>Não compartilhar códigos de autenticação;</li>
                            <li>Utilizar um e-mail ao qual tenha acesso;</li>
                            <li>Sair da conta quando utilizar dispositivos compartilhados;</li>
                            <li>Comunicar acessos não autorizados.</li>
                        </ul>

                        <h2>12. Armazenamento dos Dados</h2>

                        <p>
                            Os dados utilizados pelo MenteUp são armazenados
                            de acordo com a estrutura definida para o
                            funcionamento da aplicação.
                        </p>

                        <p>
                            O banco de dados PostgreSQL é utilizado para
                            armazenar informações relacionadas aos usuários,
                            turmas, atividades e demais funcionalidades do
                            sistema.
                        </p>

                        <p>
                            As informações relacionadas às notificações podem
                            incluir o FCM Token necessário para a comunicação
                            com o Firebase Cloud Messaging.
                        </p>

                        <h2>13. Atualizações da Política</h2>

                        <p>
                            Esta Política de Privacidade poderá ser atualizada
                            quando houver alterações relevantes no
                            funcionamento da plataforma, nos dados utilizados
                            ou nas funcionalidades disponibilizadas.
                        </p>

                        <p>
                            A versão atualizada será disponibilizada na própria
                            plataforma para consulta dos usuários.
                        </p>

                        <h2>14. Acesso à Política de Privacidade</h2>

                        <p>
                            A Política de Privacidade permanece disponível no
                            MenteUp por meio de uma página própria, acessível
                            aos usuários a qualquer momento.
                        </p>

                        <p>
                            Durante o cadastro, o usuário deverá consultar a
                            Política de Privacidade antes de concluir o
                            processo de criação da conta.
                        </p>

                        <h2>15. Contato</h2>

                        <p>
                            Para dúvidas, solicitações ou questões relacionadas
                            à privacidade e ao uso dos dados no MenteUp, o
                            usuário deverá utilizar o canal de contato por e-mail.
                        </p>

                        
                        <p>
                            <strong>Empresa:</strong> MenteUp
                        </p>

                        <p>
                            <strong>E-mail:</strong>{" "}
                            empresa.menteup@gmail.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PoliticaPrivacidade;