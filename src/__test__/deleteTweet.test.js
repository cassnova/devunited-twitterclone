import { deleteTweet } from "../App";
import { render, screen } from '@testing-library/react'

describe("Funcion que elimina un tweet", () => {
    test("Hago click en el boton para eliminar el tweet y se deberia borrar", () => {
        render(deleteTweet);
        const component = screen.getByText("Error", { exact: false });
        expect(component).toBeInTheDocument();
    });
});