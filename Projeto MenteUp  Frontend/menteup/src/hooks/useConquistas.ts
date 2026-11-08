import { useContext } from "react";
import { ConquistasContexto, type ValorConquistas } from "../context/conquistasContexto";

export function useConquistas(): ValorConquistas {
    const valor = useContext(ConquistasContexto);
    if (!valor) {
        throw new Error("useConquistas precisa estar dentro do ConquistasProvider");
    }
    return valor;
}
