import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
    children: React.ReactNode;
    permitido: string[];
}

function PrivateRoute({
    children,
    permitido
}: PrivateRouteProps) {

    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario")

    // Não está logado
    if (!token || !usuarioSalvo) {
        console.log("❌ Sem token ou usuário");
        return <Navigate to="/login" replace />;
    }

    let usuario;

    try {
        usuario = JSON.parse(usuarioSalvo);
    } catch (error) {
        // Dado salvo corrompido: limpa e volta para o login
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        return <Navigate to="/login" replace />;
    }

  
    // Verifica permissão
    if (!permitido.includes(usuario.tipoUsuario)) {
        return <Navigate to="/login" replace />;
    }


    return <>{children}</>;
}

export default PrivateRoute;