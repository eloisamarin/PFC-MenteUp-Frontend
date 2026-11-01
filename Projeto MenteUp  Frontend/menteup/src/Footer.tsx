import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="mt-auto border-t border-gray-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-6 py-5 text-sm text-gray-500 md:flex-row">

                <span>
                    © {new Date().getFullYear()} MenteUp
                </span>

                <span className="hidden md:inline">
                    |
                </span>

                <Link
                    to="/termo-de-aceite"
                    className="text-purple-600 hover:underline"
                >
                    Termo de Aceite
                </Link>

                <span className="hidden md:inline">
                    |
                </span>

                <Link
                    to="/politica-privacidade"
                    className="text-purple-600 hover:underline"
                >
                    Política de Privacidade
                </Link>

            </div>
        </footer>
    );
}

export default Footer;