import { Routes, Route, useNavigate } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";

import DashboardAluno from "./pages/aluno/dashboardAluno";
import AtividadesAluno from "./pages/aluno/atividadesAluno";
import TurmasAluno from "./pages/aluno/turmasAluno";
import Ranking from "./pages/aluno/Ranking";
import ResponderAtividadesAluno from "./pages/aluno/ResponderAtividadeAluno";
import DesafiosAluno from "./pages/Desafio/desafiosAluno.tsx";
import JogarDesafio from "./pages/Desafio/JogarDesafio.tsx";

import DashboardProfessor from "./pages/professor/dashboardProfessor.tsx";
import AtividadesProfessor from "./pages/professor/atividadesProfessor";
import VisualizarAtividadeProfessor from "./pages/professor/VisualizarAtividadeProfessor";
import EditarAtividadeProfessor from "./pages/professor/EditarAtividadeProfessor";
import CriarAtividadeProfessor from "./pages/professor/CriarAtividadeProfessor";
import DeletarAtividadeProfessor from "./pages/professor/DeletarAtividadeProfessor";

import DashboardAdmin from "./pages/Administrador/DashboardAdministrador.tsx";
import Usuarios from "./pages/Administrador/usuario";
import VisualizarAtividadeAdministrador from "./pages/Administrador/VisualizarAtividadeAdministrador";
import EditarAtividadeAdministrador from "./pages/Administrador/EditarAtividadeAdministrador";
import DeletarAtividadeAdministrador from "./pages/Administrador/DeletarAtividadeAdministrador";
import CriarAtividadeAdministrador from "./pages/Administrador/CriarAtividadeAdministrador";
import AtividadesAdministrador from "./pages/Administrador/AtividadesAdministrador";
import LogsAdministrador from "./pages/Administrador/LogsAdministrador.tsx";

import TurmasGestao from "./pages/Desafio/TurmasGestao.tsx";
import DetalheTurma from "./pages/Desafio/DetalheTurma.tsx";
import DesafiosGestao from "./pages/Desafio/DesafiosGestao.tsx";
import CriarDesafio from "./pages/Desafio/CriarDesafio.tsx";
import ConduzirDesafio from "./pages/Desafio/ConduzirDesafio.tsx";
import DesempenhoAluno from "./pages/Desempenho/DesempenhoAluno.tsx";

import PrivateRoute from "./routes/privateRoute";
import Verificar2FA from "./pages/Verificar2FA.tsx";
import { ouvirNotificacoesFCM } from "./firebase/fcmService";
import TermoAceite from "./pages/TermoAceite";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import Footer from "./Footer";
import Desempenho from "./pages/Desempenho/Desempenho.tsx";


import { useEffect } from "react";


function App() {
    const navigate = useNavigate();

    useEffect(() => {

        function receberMensagem(event: MessageEvent) {

            if (event.data?.tipo === "ABRIR_ATIVIDADES") {
                navigate("/aluno/atividades");
            }
        }

        navigator.serviceWorker.addEventListener(
            "message",
            receberMensagem
        );

        return () => {
            navigator.serviceWorker.removeEventListener(
                "message",
                receberMensagem
            );
        };

    }, [navigate]);
    useEffect(() => {

        console.log("🔔 Registrando listener do FCM...");

        ouvirNotificacoesFCM();

        console.log("🔔 Listener do FCM registrado!");

    }, []);

    return (
        <div className="flex min-h-screen flex-col">

            <main className="flex-1">

                <Routes>

                    {/* PÚBLICO */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/verificar-2fa" element={<Verificar2FA />} />


                    {/* ALUNO */}
                    <Route
                        path="/aluno/dashboard"
                        element={
                            <PrivateRoute permitido={["ALUNO"]}>
                                <DashboardAluno />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/aluno/turmas"
                        element={
                            <PrivateRoute permitido={["ALUNO"]}>
                                <TurmasAluno />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/aluno/atividades"
                        element={
                            <PrivateRoute permitido={["ALUNO"]}>
                                <AtividadesAluno />
                            </PrivateRoute>
                        }

                    />
                    <Route
                        path="/aluno/ranking"
                        element={
                            <PrivateRoute permitido={["ALUNO"]}>
                                <Ranking />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/aluno/atividades/responder/:id"
                        element={
                            <PrivateRoute permitido={["ALUNO"]}>
                                <ResponderAtividadesAluno />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/aluno/desafios"
                        element={
                            <PrivateRoute permitido={["ALUNO"]}>
                                <DesafiosAluno />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/aluno/desafios/:id"
                        element={
                            <PrivateRoute permitido={["ALUNO"]}>
                                <JogarDesafio />
                            </PrivateRoute>
                        }
                    />

                    {/* PROFESSOR */}
                    <Route
                        path="/professor/dashboard"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <DashboardProfessor />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/professor/atividades"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <AtividadesProfessor />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/professor/turmas"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <TurmasGestao perfil="PROFESSOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/turmas/:id"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <DetalheTurma perfil="PROFESSOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/desafios"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <DesafiosGestao perfil="PROFESSOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/desafios/criar"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <CriarDesafio perfil="PROFESSOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/desafios/:id/editar"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <CriarDesafio perfil="PROFESSOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/desafios/:id"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <ConduzirDesafio perfil="PROFESSOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/atividades/criar"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <CriarAtividadeProfessor />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/atividades/:id"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <VisualizarAtividadeProfessor />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/atividades/editar/:id"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <EditarAtividadeProfessor />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/atividades/deletar/:id"
                        element={<DeletarAtividadeProfessor />}

                    />
                    <Route
                        path="/professor/desempenho/:turmaId/alunos/:alunoId"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <DesempenhoAluno perfil="PROFESSOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/professor/desempenho"
                        element={
                            <PrivateRoute permitido={["PROFESSOR"]}>
                                <Desempenho perfil="PROFESSOR" />
                            </PrivateRoute>
                        }
                    />

                    {/* ADMINISTRADOR */}
                    <Route
                        path="/administrador/turmas"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <TurmasGestao perfil="ADMINISTRADOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/turmas/:id"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <DetalheTurma perfil="ADMINISTRADOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/desafios"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <DesafiosGestao perfil="ADMINISTRADOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/desafios/criar"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <CriarDesafio perfil="ADMINISTRADOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/desafios/:id/editar"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <CriarDesafio perfil="ADMINISTRADOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/desafios/:id"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <ConduzirDesafio perfil="ADMINISTRADOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/dashboard"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <DashboardAdmin />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/administrador/usuarios"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <Usuarios />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/atividades"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <AtividadesAdministrador />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/atividades/criar"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <CriarAtividadeAdministrador />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/atividades/:id"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <VisualizarAtividadeAdministrador />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/atividades/editar/:id"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <EditarAtividadeAdministrador />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/atividades/deletar/:id"
                        element={<DeletarAtividadeAdministrador />}

                    />

                    <Route
                        path="/administrador/logs"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <LogsAdministrador />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/desempenho/:turmaId/alunos/:alunoId"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <DesempenhoAluno perfil="ADMINISTRADOR" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/administrador/desempenho"
                        element={
                            <PrivateRoute permitido={["ADMINISTRADOR"]}>
                                <Desempenho perfil="ADMINISTRADOR" />
                            </PrivateRoute>
                        }
                    />
                    {/* DOCUMENTOS */}
                    <Route
                        path="/termo-de-aceite"
                        element={<TermoAceite />}
                    />

                    <Route
                        path="/politica-privacidade"
                        element={<PoliticaPrivacidade />}
                    />


                </Routes>

            </main>

            <Footer />

        </div>
    );
}

export default App;
